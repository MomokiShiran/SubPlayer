import styled from 'styled-components';
import React, { useState, useCallback, useEffect } from 'react';
import { Table } from 'react-virtualized';
import unescape from 'lodash/unescape';
import debounce from 'lodash/debounce';
import { Translate } from 'react-i18nify';

const Style = styled.div`
    position: relative;
    box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
    background-color: rgb(0 0 0 / 100%);

    .ReactVirtualized__Table {
        .ReactVirtualized__Table__Grid {
            outline: none;
        }

        .ReactVirtualized__Table__row {
            .item {
                    height: 100%;
                    padding: 5px;
                    display: flex;
                    gap: 5px;
                    position: relative;

                    .split-button {
                        position: absolute;
                        bottom: 4px;
                        right: 4px;
                        padding: 3px 10px;
                        color: #fff;
                        font-size: 10px;
                        font-weight: 500;
                        border-radius: 3px;
                        background-color: rgb(0 0 0);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        cursor: pointer;
                        z-index: 10;
                        user-select: none;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    }
                    
                    .split-button:hover {
                        background-color: rgb(30 30 30);
                        border-color: rgba(255, 255, 255, 0.5);
                        transform: translateY(-1px);
                        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
                    }
                    
                    .split-button:active {
                        transform: translateY(0);
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                    }
                    
                    &.highlight .split-button {
                        background-color: rgb(40 40 40);
                    }
                    
                    &.illegal .split-button {
                        background-color: rgb(163 49 0);
                    }

                    .time-container {
                        width: 70px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        gap: 2px;
                    }

                    .time {
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 12px;
                        text-align: center;
                        user-select: none;
                        transition: color 0.2s ease;
                    }

                    &.highlight .time {
                        color: rgba(255, 255, 255, 0.9);
                    }

                    &.illegal .time {
                        color: rgba(255, 100, 100, 0.9);
                    }

                    .textarea {
                        border: none;
                        width: 100%;
                        height: 100%;
                        color: #fff;
                        font-size: 12px;
                        padding: 10px;
                        text-align: center;
                        background-color: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transition: background-color 0.2s ease, border-color 0.2s ease;
                        resize: none;
                        outline: none;

                    &.highlight {
                        background-color: rgb(0 87 158);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }

                    &.illegal {
                        background-color: rgb(123 29 0);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                }
            }
        }
    }
`;

export default function Subtitles({ currentIndex, subtitle, checkSub, player, updateSub, splitSub }) {
    const [height, setHeight] = useState(100);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [focusing, setFocusing] = useState(false);

    const resize = useCallback(() => {
        setHeight(document.body.clientHeight - 170);
    }, [setHeight]);

    useEffect(() => {
        resize();
        if (!resize.init) {
            resize.init = true;
            const debounceResize = debounce(resize, 500);
            window.addEventListener('resize', debounceResize);
        }

        const handleDocumentClick = (e) => {
            const target = e.target;
            if (!target.closest('.textarea') && !target.closest('.split-button')) {
                setFocusing(false);
            }
        };
        
        document.addEventListener('click', handleDocumentClick);
        
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [resize, setFocusing]);

    return (
        <Style className="subtitles">
            <Table
                headerHeight={40}
                width={250}
                height={height}
                rowHeight={80}
                scrollToIndex={currentIndex}
                rowCount={subtitle.length}
                rowGetter={({ index }) => subtitle[index]}
                headerRowRenderer={() => null}
                rowRenderer={(props) => {
                    const isFocused = focusing && focusedIndex === props.index;
                    
                    const handleTextareaClick = (e) => {
                        e.stopPropagation();
                        if (player) {
                            player.pause();
                        }
                        setFocusedIndex(props.index);
                        setFocusing(true);
                        if (e.target.selectionStart !== undefined) {
                            setCursorPosition(e.target.selectionStart);
                        }
                    };
                    
                    const handleTextareaFocus = (e) => {
                        setFocusedIndex(props.index);
                        setFocusing(true);
                        if (e.target.selectionStart !== undefined) {
                            setCursorPosition(e.target.selectionStart);
                        }
                    };
                    
                    const handleTextareaKeyDown = (e) => {
                        if (e.target.selectionStart !== undefined) {
                            setCursorPosition(e.target.selectionStart);
                        }
                    };
                    
                    const handleSplit = (e) => {
                        e.stopPropagation();
                        splitSub(props.rowData, cursorPosition);
                        setFocusing(false);
                    };
                    
                    return (
                        <div
                            key={props.key}
                            className={props.className}
                            style={props.style}
                            onClick={() => {
                                if (player) {
                                    player.pause();
                                    if (player.duration >= props.rowData.startTime) {
                                        player.currentTime = props.rowData.startTime + 0.001;
                                    }
                                }
                            }}
                        >
                            <div className="item">
                                {isFocused && splitSub && (
                                    <div className="split-button" onClick={handleSplit}>
                                        <Translate value="SPLIT" />
                                    </div>
                                )}
                                <div className="time-container">
                                    <div className="time start-time">{props.rowData.start}</div>
                                    <div className="time end-time">{props.rowData.end}</div>
                                </div>
                                <textarea
                                    maxLength={200}
                                    spellCheck={false}
                                    className={[
                                        'textarea',
                                        currentIndex === props.index ? 'highlight' : '',
                                        checkSub(props.rowData) ? 'illegal' : '',
                                    ]
                                        .join(' ')
                                        .trim()}
                                    value={unescape(props.rowData.text)}
                                    onChange={(event) => {
                                        updateSub(props.rowData, {
                                            text: event.target.value,
                                        });
                                        if (event.target.selectionStart !== undefined) {
                                            setCursorPosition(event.target.selectionStart);
                                        }
                                    }}
                                    onClick={handleTextareaClick}
                                    onFocus={handleTextareaFocus}
                                    onKeyDown={handleTextareaKeyDown}
                                />
                            </div>
                        </div>
                    );
                }}
            ></Table>
        </Style>
    );
}
