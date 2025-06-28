import videoJs from 'video.js'
import 'videojs-youtube'
import 'videojs-contrib-quality-levels'
import 'videojs-hls-quality-selector'
import 'videojs-vr'
import 'videojs-mobile-ui';

import { Subscription, interval, fromEvent } from 'rxjs'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { IWidgetsPlayerMediaData } from '../_models/player-media.model'
import { NsContent } from './widget-content.model'
import { WsEvents } from 'library/ws-widget/utils/src/lib/services/event.model'

import window from 'global/window';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
export const videojsEventNames = {
  disposing: 'disposing',
  ended: 'ended',
  exitfullscreen: 'exitfullscreen',
  fullscreen: 'fullscreen',
  mute: 'mute',
  pause: 'pause',
  play: 'play',
  ready: 'ready',
  seeked: 'seeked',
  unmute: 'unmute',
  volumechange: 'volumechange',
  loadeddata: 'loadeddata',
  loadedmetadata: 'loadedmetadata',
}
export type telemetryEventDispatcherFunction = (e: any) => void
export type saveContinueLearningFunction = (d: any) => void
export type fireRealTimeProgressFunction = (i: string, d: any) => void

// function playerCurrentState(player: videoJs.Player): WsEvents.EnumTelemetryMediaState {
//   try {
//     if (!player) {
//       return WsEvents.EnumTelemetryMediaState.NOT_STARTED
//     }
//     if (player.ended()) {
//       return WsEvents.EnumTelemetryMediaState.ENDED
//     }
//     if (player.paused()) {
//       return WsEvents.EnumTelemetryMediaState.PAUSED
//     }
//     return WsEvents.EnumTelemetryMediaState.PLAYING
//   } catch (err) {
//     return WsEvents.EnumTelemetryMediaState.ENDED
//   }
// }
// function getTimeInfo(
//   player: videoJs.Player,
// ): {
//   currentTime: number | null;
//   totalTime: number | null;
// } {
//   try {
//     return {
//       currentTime: player.currentTime(),
//       totalTime: player.duration(),
//     }
//   } catch (err) { }
//   return {
//     currentTime: null,
//     totalTime: null,
//   }
// }
function eventDispatchHelper(
  passThroughData: any,
  dispatcher: telemetryEventDispatcherFunction,
  state: WsEvents.EnumTelemetrySubType,
  data: IWidgetsPlayerMediaData,
  widgetSubType: string,
  playerState: string,
  mimeT: string,
) {
  if (state === WsEvents.EnumTelemetrySubType.Loaded || WsEvents.EnumTelemetrySubType.Unloaded) {
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: {
        widgetSubType,
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
      },
      to: '',
      data: {
        state,
        passThroughData,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        identifier: data.identifier,
        playerStatus: playerState,
        mimeType: mimeT,
      },
    }
    dispatcher(event)
  }
  if (state === WsEvents.EnumTelemetrySubType.HeartBeat) {
    const heartBeatEvent = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Trace,
      from: {
        widgetSubType,
        type: 'widget',
        widgetType: ROOT_WIDGET_CONFIG.player._type,
      },
      to: '',
      data: {
        identifier: data.identifier,
        eventSubType: WsEvents.EnumTelemetrySubType.HeartBeat,
        mimeType: mimeT,
        mode: WsEvents.WsTimeSpentMode.Play,
        type: WsEvents.WsTimeSpentType.Player,
      },
    }
    dispatcher(heartBeatEvent)
  }
}

function generateEventDispatcherHelper(
  passThroughData: any,
  dispatcher: any,
  widgetSubType: string,
) {
  // let activityStartedAt: Date | null = null
  return (
    eventType: WsEvents.EnumTelemetrySubType,
    widgetData: IWidgetsPlayerMediaData,
    playerState: WsEvents.EnumTelemetryMediaActivity,
    mimeType: NsContent.EMimeTypes,
  ) => {
    // if (eventType === WsEvents.EnumTelemetrySubType.Loaded) {
    //   activityStartedAt = new Date()
    // }
    eventDispatchHelper(
      passThroughData,
      dispatcher,
      eventType,
      widgetData,
      widgetSubType,
      playerState,
      mimeType,
    )
  }
}
function saveContinueLearning(
  widgetData: IWidgetsPlayerMediaData,
  saveCLearning: saveContinueLearningFunction,
  currentTime: any,
) {
  const data = {
    resourceId: widgetData.identifier,
    dateAccessed: Date.now(),
    data: JSON.stringify({
      progress: currentTime,
      timestamp: Date.now(),
    }),
  }
  saveCLearning(data)
}
function fireRealTimeProgress(
  mimeT: string,
  widgetData: IWidgetsPlayerMediaData,
  fireRProgress: fireRealTimeProgressFunction,
  cTime: number,
  dTime: number,
) {
  const data = {
    content_type: 'Resource',
    current: [cTime.toString()],
    max_size: dTime,
    mime_type: mimeT,
    user_id_type: 'uuid',
  }
  if (widgetData.identifier) {
    fireRProgress(widgetData.identifier, data)
  }
}

export function videoJsInitializer(
  elem: HTMLVideoElement | HTMLAudioElement,
  config: videoJs.PlayerOptions,
  dispatcher: telemetryEventDispatcherFunction,
  saveCLearning: saveContinueLearningFunction,
  fireRProgress: fireRealTimeProgressFunction,
  passThroughData: any,
  widgetSubType: string,
  resumePoint: number = 0,
  enableTelemetry: boolean,
  widgetData: IWidgetsPlayerMediaData,
  mimeType: NsContent.EMimeTypes,
): { player: videoJs.Player; dispose: () => void } {
  let isFullscreenActive = false;
  const extendedConfig = {
    ...config
  };
  const player:any = videoJs(elem, extendedConfig)
  player.volume(0.8) // Set default volume to 80%
  player.muted(false) // Ensure video is not muted
  player.mobileUi({
    fullscreen: {
      enterOnRotate: false,
      exitOnRotate: true,
      lockOnRotate: true,
      disabled: true,
      iOS: true,
    },
    touchControls: {
      tap: true,
      seekSeconds: 10,
      disableOnEnd: true,
    },
    touchOverlay: true,
  });
  marker(widgetData, player)
  const eventDispatcher = enableTelemetry
    ? generateEventDispatcherHelper(passThroughData, dispatcher, widgetSubType)
    : () => undefined
  let heartBeatSubscription: Subscription
  let currentTimeInterval: Subscription
  let loaded = false
  let readyToRaise = false
  let currTime = resumePoint || 0 

  
  if (videoJs.browser.IS_IOS && videoJs.browser.IOS_VERSION > 9) {
    player.tech_.el_.setAttribute('playsinline', 'playsinline');
    player.tech_.supportsFullScreen = () => false;
  }

  const lockOrientationUniversal = (mode: string) => {
    const screenOrientation = new ScreenOrientation();
    screenOrientation.unlock()
    screenOrientation.lock(screenOrientation.ORIENTATIONS.LANDSCAPE)
  };

  const unlockOrientation = () => {
    const screenOrientation = new ScreenOrientation();
    screenOrientation.unlock()
    screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT)
  };
  const enterFullscreen = async() => {
    if (isFullscreenActive || player.ended()) return;
    player.requestFullscreen();
    lockOrientationUniversal('landscape');
  };
  const exitFullscreenOnPauseOrEnd = () => {
    if (player.ended()) {
      console.log('ended')
      player.exitFullscreen();
      unlockOrientation();
    } else {
      player.exitFullscreen();
      unlockOrientation();
    }
  };
  if (enableTelemetry) {
    // player.on(videojsEventNames.loadeddata, () => {
    //   try {
    //     if (resumePoint) {
    //       const start = Number(resumePoint)
    //       // if (start > 10 && player.duration() - start > 20) {
    //       //   player.currentTime(start - 10)
    //       // }
    //       player.currentTime(start)
    //     }
    //   } catch (err) { }
    // })
    player.on(videojsEventNames.loadedmetadata, () => {
      try {
        if (resumePoint) {
          const start = Number(resumePoint);
          console.log("Trying to resume at:", start);
          
          let retryCount = 0;
          const maxRetries = 10; // Adjust based on requirement
    
          const interval = setInterval(() => {
            if (player.currentTime() !== start) {
              player.currentTime(start);
              retryCount++;
            } else {
              clearInterval(interval);
              console.log("Successfully resumed at:", player.currentTime());
            }
            if (retryCount >= maxRetries) {
              clearInterval(interval);
              console.warn("Max retries reached, stopping resume attempts");
            }
          }, 500);
        }
      } catch (err) {
        console.error("Error setting resume time:", err);
      }
    });
    player.ready(() => {
      player.on(videojsEventNames.play, async () => {
        if (!isFullscreenActive) {
          setTimeout(async () => {
            await enterFullscreen();
          }, 100);
        }

        if (!loaded) {
          eventDispatcher(
            WsEvents.EnumTelemetrySubType.Loaded,
            widgetData,
            WsEvents.EnumTelemetryMediaActivity.PLAYED,
            mimeType
          );
          heartBeatSubscription = interval(2 * 60000).subscribe((_) => {
            eventDispatcher(
              WsEvents.EnumTelemetrySubType.HeartBeat,
              widgetData,
              WsEvents.EnumTelemetryMediaActivity.PLAYED,
              mimeType
            );
          });
          loaded = true;
        }
        currentTimeInterval = interval(500).subscribe((_) => {
          const currPercentage =
            (player.currentTime() / player.duration()) * 100;
          const roundedPercentage = Math.round(currPercentage / 5) * 5;
          if (roundedPercentage !== currTime) {
            currTime = roundedPercentage;
            fireRealTimeProgress(
              mimeType,
              widgetData,
              fireRProgress,
              player.currentTime(),
              player.duration()
            );
          }
        });
      });
    });
    player.on(videojsEventNames.ended, () => {
      exitFullscreenOnPauseOrEnd()
      if (loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
        loaded = false
        heartBeatSubscription.unsubscribe()
        currentTimeInterval.unsubscribe()
      }
    })
   
    player.on(videojsEventNames.pause, () => {
      if (loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PAUSED, mimeType)
        loaded = false
        heartBeatSubscription.unsubscribe()
        currentTimeInterval.unsubscribe()
      }
      currTime = player.currentTime()
    })
    player.on('fullscreenchange', () => {
      const currentlyFullscreen = player.isFullscreen();
      isFullscreenActive = currentlyFullscreen;
      if (player.isFullscreen() && !player.ended()) { 
        console.log("Entering fullscreen: Rotating to landscape...");
        lockOrientationUniversal('landscape');
      } else if (!player.isFullscreen() && loaded) { 
        exitFullscreenOnPauseOrEnd();
        isFullscreenActive = false
        player.pause();
      }else if (!player.isFullscreen() && !loaded) { 
        exitFullscreenOnPauseOrEnd();
        player.pause();
        loaded = true
        isFullscreenActive = false
      }
      if (player.ended()) {
        player.pause();
        exitFullscreenOnPauseOrEnd();
        isFullscreenActive = false
      }
    });
  }
  const dispose = () => {
    saveContinueLearning(widgetData, saveCLearning, currTime)
    if (heartBeatSubscription) {
      heartBeatSubscription.unsubscribe()
    }
    if (currentTimeInterval) {
      currentTimeInterval.unsubscribe()
    }
    if (loaded) {
      eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
    }
    if (readyToRaise) {
      fireRealTimeProgress(mimeType, widgetData, fireRProgress, currTime, player.duration())
    }
  }
  return { player, dispose }
}
export function videoInitializer(
  elem: HTMLVideoElement,
  dispatcher: telemetryEventDispatcherFunction,
  saveCLearning: saveContinueLearningFunction,
  fireRProgress: fireRealTimeProgressFunction,
  passThroughData: any,
  widgetSubType: string,
  enableTelemetry: boolean,
  widgetData: IWidgetsPlayerMediaData,
  mimeType: NsContent.EMimeTypes,
): { dispose: () => void } {
  const eventDispatcher = enableTelemetry
    ? generateEventDispatcherHelper(passThroughData, dispatcher, widgetSubType)
    : () => undefined
  let heartBeatSubscription: Subscription
  let currentTimeInterval: Subscription
  let playSubscription: Subscription
  let pauseSubscription: Subscription
  let endedSubscription: Subscription
  let loaded = false
  let readyToRaise = false
  let currTime = 0
  if (enableTelemetry) {
    playSubscription = fromEvent(elem, 'play').subscribe(() => {
      if (!loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
        heartBeatSubscription = interval(2 * 60000).subscribe(_ => {
          eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
        })
        loaded = true
      }
      currentTimeInterval = interval(500).subscribe(_ => {
        if (elem.currentTime >= elem.duration * 5 / 100 && elem.currentTime < elem.duration * 95 / 100
          && !readyToRaise) {
          readyToRaise = true
        }
        if (elem.currentTime >= elem.duration * 95 / 100 && readyToRaise) {
          fireRealTimeProgress(mimeType, widgetData, fireRProgress, elem.currentTime, elem.duration)
          readyToRaise = false
        }
        currTime = elem.currentTime
      })
    })
    pauseSubscription = fromEvent(elem, 'pause').subscribe(() => {
      if (loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PAUSED, mimeType)
        loaded = false
        heartBeatSubscription.unsubscribe()
        currentTimeInterval.unsubscribe()
      }
      currTime = elem.currentTime
    })
    endedSubscription = fromEvent(elem, 'ended').subscribe(() => {
      if (loaded) {
        eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
        loaded = false
        heartBeatSubscription.unsubscribe()
        currentTimeInterval.unsubscribe()
      }
    })
  }
  const dispose = () => {
    saveContinueLearning(widgetData, saveCLearning, currTime)
    if (heartBeatSubscription) {
      heartBeatSubscription.unsubscribe()
    }
    if (currentTimeInterval) {
      currentTimeInterval.unsubscribe()
    }
    if (loaded) {
      eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
    }
    if (readyToRaise) {
      fireRealTimeProgress(mimeType, widgetData, fireRProgress, currTime, elem.duration)
    }
    if (playSubscription) {
      playSubscription.unsubscribe()
    }
    if (pauseSubscription) {
      pauseSubscription.unsubscribe()
    }
    if (endedSubscription) {
      endedSubscription.unsubscribe()
    }
  }
  return { dispose }
}

export function youtubeInitializer(
  elem: HTMLElement,
  youtubeId: string,
  dispatcher: telemetryEventDispatcherFunction,
  saveCLearning: saveContinueLearningFunction,
  fireRProgress: fireRealTimeProgressFunction,
  passThroughData: any,
  widgetSubType: string,
  enableTelemetry: boolean,
  widgetData: IWidgetsPlayerMediaData,
  mimeType: NsContent.EMimeTypes,
  screenHeight: string,
): { dispose: () => void } {
  const yHeight = screenHeight
  const player = new (<any>window).YT.Player(elem, {
    videoId: youtubeId,
    width: '100%',
    height: yHeight,
    playerVars: {
      autoplay: 0,
      modestbranding: 0,
      showInfo: 0,
    },
    events: {
      onStateChange: (event: any) => {
        onPlayerStateChange(event)
      },
    },
  })
  const eventDispatcher = enableTelemetry
    ? generateEventDispatcherHelper(passThroughData, dispatcher, widgetSubType)
    : () => undefined
  let heartBeatSubscription: Subscription
  let currentTimeInterval: Subscription
  let loaded = false
  let readyToRaise = false
  let currTime = 0
  const onPlayerStateChange = (event: any) => {
    switch (event.data) {
      case (<any>window).YT.PlayerState.PLAYING:
        if (!loaded) {
          eventDispatcher(WsEvents.EnumTelemetrySubType.Loaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
          heartBeatSubscription = interval(2 * 60000).subscribe(_ => {
            eventDispatcher(WsEvents.EnumTelemetrySubType.HeartBeat, widgetData, WsEvents.EnumTelemetryMediaActivity.PLAYED, mimeType)
          })
          loaded = true
        }
        currentTimeInterval = interval(500).subscribe(_ => {
          if (player.getCurrentTime() >= player.getDuration() * 5 / 100 && player.getCurrentTime() < player.getDuration() * 95 / 100
            && !readyToRaise) {
            readyToRaise = true
          }
          if (player.getCurrentTime() >= player.getDuration() * 95 / 100 && readyToRaise) {
            fireRealTimeProgress(mimeType, widgetData, fireRProgress, player.getCurrentTime(), player.getDuration())
            readyToRaise = false
          }
          currTime = player.getCurrentTime()
        })
        break
      case (<any>window).YT.PlayerState.PAUSED:
        if (loaded) {
          eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.PAUSED, mimeType)
          loaded = false
          heartBeatSubscription.unsubscribe()
          currentTimeInterval.unsubscribe()
        }
        currTime = player.getCurrentTime()
        break
      case (<any>window).YT.PlayerState.ENDED:
        if (loaded) {
          eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
          loaded = false
          heartBeatSubscription.unsubscribe()
          currentTimeInterval.unsubscribe()
        }
        break
    }
  }
  const dispose = () => {
    saveContinueLearning(widgetData, saveCLearning, currTime)
    if (heartBeatSubscription) {
      heartBeatSubscription.unsubscribe()
    }
    if (currentTimeInterval) {
      currentTimeInterval.unsubscribe()
    }
    if (loaded) {
      eventDispatcher(WsEvents.EnumTelemetrySubType.Unloaded, widgetData, WsEvents.EnumTelemetryMediaActivity.ENDED, mimeType)
    }
    if (readyToRaise) {
      fireRealTimeProgress(mimeType, widgetData, fireRProgress, currTime, player.getDuration())
    }
  }
  return { dispose }
}
function marker(widgetData: any, player: any) {
  if (widgetData.videoQuestions) {
    let markers = convertData(widgetData.videoQuestions)
    if (player.markers) {
      player.markers({
        markerStyle: {
          width: '8px',
          'background-color': 'yellow',
        },
        markerTip: {
          display: true,
          text: function () {
            return "Quiz"
          }
        },
        markers: markers,
      })
    } else {
      console.error('Markers plugin is not loaded.')
    }
  }
}
function convertData(data: any[]): { time: number, text: string }[] {
  return data.map(item => {
    return {
      time: item.timestampInSeconds,
      text: item.question[0].text
    }
  })
}
