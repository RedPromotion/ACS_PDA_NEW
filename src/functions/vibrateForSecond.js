/**
 * vibrateForSecond 주어진 시간(초) 동안 진동을 발생시키는 함수.
 * 
 * @param {number|string} [seconds] - 진동 지속 시간(초). 
 *  - 숫자를 입력하면 해당 초만큼 진동.
 *  - 입력하지 않거나 유효하지 않은 값이면 기본값(0.8초)으로 진동.
 *  - 문자열 형태의 숫자도 허용.
 * @author sj_hong 
 * @updated 2025-02-18T10:49:00Z
 * @example
 * // 1초 동안 진동
 * vibrateForSecond(1);
 * 
 * // 2.5초 동안 진동
 * vibrateForSecond(2.5);
 * 
 * // 기본값으로 진동 (0.8초)
 * vibrateForSecond();
 * 
 * // 문자열 형태의 숫자로 3초 동안 진동
 * vibrateForSecond("3");
*/
export default function vibrateForSecond(seconds) {

  // 진동 기능 지원 여부 확인
  if (!("vibrate" in navigator)) {
    console.warn("현재 진동 기능을 지원하지 않습니다.");
    return;
  }

  // 기능 동작
  if (!seconds) {
    navigator.vibrate(800); // 기본 설정 
  } 
  else if (typeof seconds === "number") {
    navigator.vibrate(seconds * 1000);
  } 
  else if (!isNaN(Number(seconds))) {
    navigator.vibrate(Number(seconds) * 1000);
  } 
  else {
    console.warn("진동 기능에 실패했습니다.");
  }

};