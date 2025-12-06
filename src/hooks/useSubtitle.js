import React, { useState, useCallback, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import DT from 'duration-time-conversion';
import Sub from '../libs/Sub';

export const useSubtitle = (initialSubs = []) => {
  const subtitleHistory = useRef([]);
  const [subtitle, setSubtitleOriginal] = useState(initialSubs);

  const newSub = useCallback((item) => new Sub(item), []);
  const hasSub = useCallback((sub) => subtitle.indexOf(sub), [subtitle]);

  const formatSub = useCallback(
    (sub) => {
      if (Array.isArray(sub)) {
        return sub.map((item) => newSub(item));
      }
      return newSub(sub);
    },
    [newSub],
  );

  const copySubs = useCallback(() => formatSub(subtitle), [subtitle, formatSub]);

  const setSubtitle = useCallback(
    (newSubtitle, saveToHistory = true) => {
      if (!isEqual(newSubtitle, subtitle)) {
        if (saveToHistory) {
          if (subtitleHistory.current.length >= 1000) {
            subtitleHistory.current.shift();
          }
          subtitleHistory.current.push(formatSub(subtitle));
        }
        window.localStorage.setItem('subtitle', JSON.stringify(newSubtitle));
        setSubtitleOriginal(newSubtitle);
      }
    },
    [subtitle, setSubtitleOriginal, formatSub],
  );

  const undoSubs = useCallback(() => {
    const subs = subtitleHistory.current.pop();
    if (subs) {
      setSubtitle(subs, false);
    }
  }, [setSubtitle]);

  const clearSubs = useCallback(() => {
    setSubtitle([]);
    subtitleHistory.current.length = 0;
  }, [setSubtitle]);

  const checkSub = useCallback(
    (sub) => {
      const index = hasSub(sub);
      if (index < 0) return;
      const previous = subtitle[index - 1];
      return (previous && sub.startTime < previous.endTime) || !sub.check || sub.duration < 0.2;
    },
    [subtitle, hasSub],
  );

  const removeSub = useCallback(
    (sub) => {
      const index = hasSub(sub);
      if (index < 0) return;
      const subs = copySubs();
      subs.splice(index, 1);
      setSubtitle(subs);
    },
    [hasSub, copySubs, setSubtitle],
  );

  const addSub = useCallback(
    (index, sub) => {
      const subs = copySubs();
      subs.splice(index, 0, formatSub(sub));
      setSubtitle(subs);
    },
    [copySubs, setSubtitle, formatSub],
  );

  const updateSub = useCallback(
    (sub, obj) => {
      const index = hasSub(sub);
      if (index < 0) return;
      const subs = copySubs();
      const subClone = formatSub(sub);
      Object.assign(subClone, obj);
      if (subClone.check) {
        subs[index] = subClone;
        setSubtitle(subs);
      }
    },
    [hasSub, copySubs, setSubtitle, formatSub],
  );

  const mergeSub = useCallback(
    (sub) => {
      const index = hasSub(sub);
      if (index < 0) return;
      const subs = copySubs();
      const next = subs[index + 1];
      if (!next) return;
      const merge = newSub({
        start: sub.start,
        end: next.end,
        text: sub.text.trim() + '\n' + next.text.trim(),
      });
      subs[index] = merge;
      subs.splice(index + 1, 1);
      setSubtitle(subs);
    },
    [hasSub, copySubs, setSubtitle, newSub],
  );

  const splitSub = useCallback(
    (sub, start) => {
      const index = hasSub(sub);
      if (index < 0 || !sub.text || !start) return;
      const subs = copySubs();
      const text1 = sub.text.slice(0, start).trim();
      const text2 = sub.text.slice(start).trim();
      if (!text1 || !text2) return;
      const splitDuration = (sub.duration * (start / sub.text.length)).toFixed(3);
      if (splitDuration < 0.2 || sub.duration - splitDuration < 0.2) return;
      subs.splice(index, 1);
      const middleTime = DT.d2t(sub.startTime + parseFloat(splitDuration));
      subs.splice(
        index,
        0,
        newSub({
          start: sub.start,
          end: middleTime,
          text: text1,
        }),
      );
      subs.splice(
        index + 1,
        0,
        newSub({
          start: middleTime,
          end: sub.end,
          text: text2,
        }),
      );
      setSubtitle(subs);
    },
    [hasSub, copySubs, setSubtitle, newSub],
  );

  return {
    subtitle,
    subtitleHistory,
    newSub,
    hasSub,
    formatSub,
    copySubs,
    setSubtitle,
    undoSubs,
    clearSubs,
    checkSub,
    removeSub,
    addSub,
    updateSub,
    mergeSub,
    splitSub,
  };
};
