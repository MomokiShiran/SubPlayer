import React, { useEffect, createRef, memo, useCallback} from 'react';
import styled from 'styled-components';
import { isPlaying } from '../utils';

const Style = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 20% 10%;

    .video {
        display: flex;
        align-items: center;
        justify-content: center;
        height: auto;
        width: auto;
        position: relative;

        video {
            position: relative;
            z-index: 10;
            outline: none;
            max-height: 100%;
            max-width: 100%;
            box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
            background-color: #000;
            cursor: pointer;
        }

        .subtitle {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: absolute;
            z-index: 20;
            left: 0;
            right: 0;
            bottom: 5%;
            width: 100%;
            padding: 0 20px;
            user-select: none;
            pointer-events: none;

            .operate {
                padding: 5px 15px;
                color: #fff;
                font-size: 13px;
                border-radius: 3px;
                margin-bottom: 5px;
                background-color: rgb(0 0 0 / 75%);
                border: 1px solid rgb(255 255 255 / 20%);
                cursor: pointer;
                pointer-events: all;
            }

            .textarea {
                width: 100%;
                text-align: center;
                line-height: 1.2;
                color: #fff;
                font-size: 20px;
                padding: 5px 10px;
                user-select: none;
                pointer-events: none;
                background-color: rgb(0 0 0 / 0);
                text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) -1px 0px 1px,
                    rgb(0 0 0) 0px -1px 1px;
            }
        }
    }
`;

const VideoWrap = memo(
    ({ setPlayer, setCurrentTime, setPlaying }) => {
        const $video = createRef();

        useEffect(() => {
            setPlayer($video.current);
            (function loop() {
                window.requestAnimationFrame(() => {
                    if ($video.current) {
                        setPlaying(isPlaying($video.current));
                        setCurrentTime($video.current.currentTime || 0);
                    }
                    loop();
                });
            })();
        }, [setPlayer, setCurrentTime, setPlaying, $video]);

        const onClick = useCallback(() => {
            if ($video.current) {
                if (isPlaying($video.current)) {
                    $video.current.pause();
                } else {
                    $video.current.play();
                }
            }
        }, [$video]);

        return <video onClick={onClick} src="/sample.mp4?t=1" ref={$video} />;
    },
    () => true,
);

export default function Player(props) {
    const $player = createRef();

    return (
        <Style className="player">
            <div className="video" ref={$player}>
                <VideoWrap {...props} />
                {props.player && props.subtitle[props.currentIndex] ? (
                    <div className="subtitle">
                        <div className={`textarea`}>
                            {props.subtitle[props.currentIndex].text}
                        </div>
                    </div>
                ) : null}
            </div>
        </Style>
    );
}
