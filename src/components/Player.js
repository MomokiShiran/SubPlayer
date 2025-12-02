import React, { useEffect, createRef, memo, useRef} from 'react';
import styled from 'styled-components';
import DPlayer from 'dplayer';

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

        .subtitle {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: absolute;
            z-index: 20;
            left: 0;
            right: 0;
            bottom: 15%;
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
        const playerRef = useRef(null);

        useEffect(() => {
            if ($video.current) {
                // 创建DPlayer实例
                playerRef.current = new DPlayer({
                    container: $video.current,
                    video: {
                        url: '/sample.mp4?t=1',
                    },
                    autoplay: false,
                    controls: true, // 启用控制条
                    mutex: true,
                    volume: 0.5,
                    // 自定义控制条显示设置
                    playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
                    screenshot: false,
                    airplay: false,
                    chromecast: false
                });

                setPlayer(playerRef.current.video);

                // 监听时间更新
                playerRef.current.on('timeupdate', () => {
                    setCurrentTime(playerRef.current.video.currentTime || 0);
                    setPlaying(!playerRef.current.video.paused);
                });

                // 监听播放/暂停事件
                playerRef.current.on('play', () => {
                    setPlaying(true);
                });

                playerRef.current.on('pause', () => {
                    setPlaying(false);
                });
            }

            // 组件卸载时销毁播放器
            return () => {
                if (playerRef.current) {
                    playerRef.current.destroy();
                }
            };
        }, [setPlayer, setCurrentTime, setPlaying, $video]);

        return <div ref={$video}></div>;
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
