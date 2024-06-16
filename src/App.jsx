/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [correctans, setCorrectAns] = useState("");
  const [ansArr, setAnsArr] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [timer, setTimer] = useState(10);

  const getData = async () => {
    try {
      const response = await axios.get(
        "https://opentdb.com/api.php?amount=10&type=multiple"
      );
      const data = response.data;
      if (data.response_code === 0) {
        setQuestions(data.results);
        // console.log(data.results);
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error("Rate limit exceeded. Retrying...");
        // Retry after a delay (e.g., 5 seconds)
      } else {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      setCorrectAns(questions[idx].correct_answer);
      let tm = [
        questions[idx].correct_answer,
        ...questions[idx].incorrect_answers,
      ];
      shuffleArray(tm); // Shuffle the answers array
      setAnsArr(tm);
      setTimer(10);
    }
  }, [questions, idx]);

  useEffect(() => {
    if (timer === 0) {
      skipQuestion();
    }
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const shuffleArray = (array) => {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  };

  function findAns(str) {
    if (str === correctans) {
      setCount(count + 1);
    }
    if (idx < 9) {
      setIdx(idx + 1);
      setTimer(10);
    } else {
      setShowScore(true); // Show the score after the last question
    }
  }

  function skipQuestion() {
    if (idx < 9) {
      setIdx(idx + 1);
      setTimer(10);
    } else {
      setShowScore(true); // Show the score after the last question
    }
  }

  const restartQuiz = () => {
    setCount(0);
    setIdx(0);
    setQuestions([]);
    // setCorrectAns("");
    // setAnsArr([]);
    setShowScore(false);
    getData();
  };

  return (
    <div className='container bg-green-200 w-full min-h-dvh flex items-center justify-center select-none'>
      <div className='w-fit border-4 p-8 border-gray-500'>
        {questions.length > 0 ? (
          showScore ? (
            <div className='p-4 flex flex-col items-center justify-center gap-6'>
              <h1 className='font-medium text-3xl'>Your Score: {count} / 10</h1>
              <button
                className='bg-indigo-400 px-3 py-1 rounded border-2 border-gray-500 font-medium text-orange-700 hover:bg-gray-200 hover:border-orange-500 '
                onClick={() => restartQuiz()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              <p>
                <strong>{idx + 1} .</strong> {questions[idx].question}
              </p>
              <div className='flex justify-around items-center py-6 px-2 gap-4 '>
                {ansArr.map((answer, index) => (
                  <button
                    key={index}
                    className='bg-gray-300 py-2 px-4 rounded-xl font-medium hover:bg-blue-400'
                    onClick={() => findAns(answer)}
                  >
                    {answer}
                  </button>
                ))}
              </div>
              <div className='w-60 mx-auto text-2xl'>
                <p>Time Left: {timer} Seconds</p>
              </div>
              <div className='flex justify-between items-center'>
                <div
                  className={`px-6 rounded w-fit font-medium text-white py-2 ${
                    questions[idx].difficulty === "hard"
                      ? "bg-red-500"
                      : questions[idx].difficulty === "medium"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                >
                  <p>Level: {questions[idx].difficulty}</p>
                </div>
                <button
                  className='bg-orange-400 px-3 py-2 rounded font-medium text-blue-700 hover:bg-orange-500'
                  onClick={() => skipQuestion()}
                >
                  SKIP
                </button>
              </div>
            </div>
          )
        ) : (
          <h1>Wait....</h1>
        )}
      </div>
    </div>
  );
}

export default App;
