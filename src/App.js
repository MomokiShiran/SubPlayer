import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactNotifications, Store } from 'react-notifications-component';
import styled from 'styled-components';
import Tool from './components/Tool';
import Subtitles from './components/Subtitles';
import Player from './components/Player';
import Footer from './components/Footer';
import Loading from './components/Loading';
import ProgressBar from './components/ProgressBar';
import { getKeyCode } from './utils';
import Sub from './libs/Sub';
import { useSubtitle } from './hooks/useSubtitle';

const Style = styled.div`
    height: 100%;
    width: 100%;

    .main {
        display: flex;
        height: calc(100% - 200px);

        .player {
            flex: 1;
        }

        .subtitles {
            width: 250px;
        }

        .tool {
            width: 300px;
        }
    }

    .footer {
        height: 200px;
    }
`;

export default function App({ defaultLang }) {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState('');
    const [processing, setProcessing] = useState(0);
    const [language, setLanguage] = useState(defaultLang);
    const [waveform, setWaveform] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const {
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
    } = useSubtitle([]);

    const notify = useCallback(
        (obj) => {
            // 使用react-notifications-component
            Store.addNotification({
                title: '',
                message: obj.message,
                type: obj.level || 'info',
                insert: 'top',
                container: 'top-center',
                animationIn: ['fadeIn'],
                animationOut: ['fadeOut'],
                dismiss: {
                    duration: 2000,
                    showIcon: true
                }
            });
        },
        [],
    );

    const onKeyDown = useCallback(
        (event) => {
            const keyCode = getKeyCode(event);
            switch (keyCode) {
                case 32:
                    event.preventDefault();
                    if (player) {
                        if (playing) {
                            player.pause();
                        } else {
                            player.play();
                        }
                    }
                    break;
                case 90:
                    event.preventDefault();
                    if (event.metaKey) {
                        undoSubs();
                    }
                    break;
                default:
                    break;
            }
        },
        [player, playing, undoSubs],
    );

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    useMemo(() => {
        const currentIndex = subtitle.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime);
        setCurrentIndex(currentIndex);
    }, [currentTime, subtitle]);

    useEffect(() => {
        const localSubtitleString = window.localStorage.getItem('subtitle');
        const fetchSubtitle = () =>
            fetch('/sample.json')
                .then((res) => res.json())
                .then((res) => {
                    setSubtitle(res.map((item) => new Sub(item)), false);
                });

        if (localSubtitleString) {
            try {
                const localSubtitle = JSON.parse(localSubtitleString);
                if (localSubtitle.length) {
                    setSubtitle(localSubtitle.map((item) => new Sub(item)), false);
                } else {
                    fetchSubtitle();
                }
            } catch (error) {
                fetchSubtitle();
            }
        } else {
            fetchSubtitle();
        }
    }, [setSubtitle]);

    const props = {
        player,
        setPlayer,
        subtitle,
        setSubtitle,
        waveform,
        setWaveform,
        currentTime,
        setCurrentTime,
        currentIndex,
        setCurrentIndex,
        playing,
        setPlaying,
        language,
        setLanguage,
        loading,
        setLoading,
        setProcessing,
        subtitleHistory,

        notify,
        newSub,
        hasSub,
        checkSub,
        removeSub,
        addSub,
        undoSubs,
        clearSubs,
        updateSub,
        formatSub,
        mergeSub,
        splitSub,
    };

    return (
        <Style>
            <div className="main">
                <Player {...props} />
                <Subtitles {...props} />
                <Tool {...props} />
            </div>
            <Footer {...props} />
            {loading ? <Loading loading={loading} /> : null}
            {processing > 0 && processing < 100 ? <ProgressBar processing={processing} /> : null}
            <ReactNotifications />
        </Style>
    );
}
