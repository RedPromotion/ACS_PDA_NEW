import thathurts from '../assets/audio/thathurts.wav'
import error from '../assets/audio/uiAlert.ogg'
const audioMap = {
  thathurts,
  error
}
/**
 * 지정된 오디오 파일을 재생합니다.
 *
 * @function playAlramSound
 * @param {object} [options={}] - 옵션 객체
 * @param {'thathurts' | 'error'} [options.file='error'] - 재생할 오디오 파일 키. 'thathurts' 또는 'error' 중 하나를 선택합니다.
 * @param {number} [options.volume=1] - 오디오 볼륨 (0.0 ~ 1.0).
 * @param {number} [options.repeat=1] - 반복 재생 횟수 (양의 정수, 5회까지 지정 가능).
 *
 * @example
 * // 기본값으로 한 번 재생 예시 (options.file이 'error'로 설정됩니다)
 * playAlramSound();
 *
 * @example
 * // 'thathurts' 파일을 낮은 볼륨으로 세 번 반복 재생 예시
 * playAlramSound({ file: 'thathurts', volume: 0.5, repeat: 3 });
 */
export function playAlramSound({ file = 'error', volume = 1, repeat = 1 } = {}) {
  
  //파일에 맞는 소리 설정
  const audioSrc = audioMap[file]
  if (!audioSrc) {
    console.warn(`Unsupported audio file: ${file}`)
    return
  }

  //최대 가능한 안전범위 횟수 설정
  const MAX_REPEAT = 5
  const repeatInSafeRange = Math.min(Math.max(1, repeat), MAX_REPEAT)

  //오디오 동작 함수
  const playInstance = () => {
    const audio = new Audio(audioSrc)
    audio.volume = volume
    audio.play().catch(err => console.error('Audio play failed:', err))
  }

  //횟수 만큼 실제 소리 동작 (간섭제외용 시간 추가)
  for (let i = 0; i < repeatInSafeRange; i++) {
    setTimeout(playInstance, i * 500)
  }
}