// developer-Will
// this file plays the happy sound when an answer is right
// and the sad sound when an answer is wrong

// this turns a sound file into something we can play
function createSound(url) {
  const sound = new Audio(url)

  // load the sound now, so it is ready to play fast later
  sound.preload = 'auto'

  return sound
}

export default class SoundEffectService {
  // we are given the two sound files when we are made
  constructor({ correctUrl, incorrectUrl }) {
    // the happy sound, for a right answer
    this.correctSound = createSound(correctUrl)

    // the sad sound, for a wrong answer
    this.incorrectSound = createSound(incorrectUrl)
  }

  // this plays one sound from the very start
  play(sound) {
    // go back to the start, in case the sound was just played
    sound.currentTime = 0

    // try to play the sound
    const attempt = sound.play()

    // if the browser says no, we do nothing
    // the quiz must keep working even when there is no sound
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {})
    }
  }

  // right answer plays the happy sound, wrong answer plays the sad sound
  playAnswerSound(isCorrect) {
    if (isCorrect) {
      this.play(this.correctSound)
    } else {
      this.play(this.incorrectSound)
    }
  }
}
