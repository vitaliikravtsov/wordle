const letters = document.querySelectorAll(".scoreboard-letter");
const ANSWER_LENGTH = 5;
const loadingDiv = document.querySelector('.loadingDiv');
let done = false;
const ROUNDS = 6;
// set id attrs
letters.forEach((e, i) => {
  e.setAttribute("id", `letter-${i}`);
});

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true;

  console.log(isLoading)
  
  const res = await fetch('https://words.dev-apis.com/word-of-the-day')
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split('');
  isLoading = false;
  setLoading(isLoading);
  
  console.log(isLoading)

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
  }

  
  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      return;
    }


    isLoading = true;
    setLoading(true);

    const res = await fetch('https://words.dev-apis.com/validate-word', {
      method: 'POST',
      body: JSON.stringify({word: currentGuess})
    });

    const resObj = await res.json();
    // const validWord = resObj.validWord;
    const {validWord} = resObj;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }


    //mark as correct
    const guessParts = currentGuess.split('');
    const map =  makeMap(wordParts);
    console.log(map);


    for (let i = 0; i < ANSWER_LENGTH; i++) {
      //mark as correct
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
        map[guessParts[i]]--;
        console.log(guessParts[i])
      }
    }

    for( let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing;
      } else if(wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
      }
    }

    currentRow++;
    

    if (currentGuess === word) {
      document.querySelector('.brand').classList.add('winner')
      done = true;
      return;
    } else if (currentRow === ROUNDS) {
      // alert('you looser. the word was ' + word);
      console.log('looser')
      done = true
    }

    currentGuess = "";
  }

  function backspace () {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
  }

  function markInvalidWord() {
    for( let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');

      setTimeout(function() {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid');
      }, 10)
    }
  }

  document.addEventListener("keydown", function handleKetPress(event) {
    if (done || isLoading) {
      return;
    }
    const action = event.key;

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // return;
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle('hidden', !isLoading);
    console.log(isLoading)
}

function makeMap(array) {
  const obj = {};
  for(let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++
    } else {
      obj[letter] = 1;
    }
  }

  return obj;
}

init();
