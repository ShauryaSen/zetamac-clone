import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Container,
  Heading,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'

type TimeLimit = 30 | 60 | 120
type Operation = '+' | '-' | '*' | '/'

interface Problem {
  num1: number
  num2: number
  operation: Operation
}

function App() {
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(60)
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState('')
  const [maxNumber, setMaxNumber] = useState(100)
  const [operations, setOperations] = useState<Operation[]>(['+', '-', '*', '/'])

  const generateProblem = useCallback(() => {
    const operation = operations[Math.floor(Math.random() * operations.length)]
    let num1: number, num2: number

    if (operation === '/') {
      // For division, divisor is 2-12, and answer is within max range
      num2 = Math.floor(Math.random() * 11) + 2 // 2 to 12
      const answer = Math.floor(Math.random() * (maxNumber - 2)) + 2 // 2 to maxNumber
      num1 = num2 * answer // This ensures the answer is within max range
    } else if (operation === '-') {
      // For subtraction, ensure positive result and minimum 2
      num1 = Math.floor(Math.random() * (maxNumber - 2)) + 2 // Minimum 2
      num2 = Math.floor(Math.random() * (num1 - 2)) + 2 // Minimum 2, but less than num1
    } else if (operation === '*') {
      // For multiplication, first number is 2-12, second number is 2-maxNumber
      num1 = Math.floor(Math.random() * 11) + 2 // 2 to 12
      num2 = Math.floor(Math.random() * (maxNumber - 2)) + 2 // 2 to maxNumber
    } else {
      num1 = Math.floor(Math.random() * (maxNumber - 2)) + 2 // Minimum 2
      num2 = Math.floor(Math.random() * (maxNumber - 2)) + 2 // Minimum 2
    }

    setCurrentProblem({ num1, num2, operation })
  }, [maxNumber, operations])

  const checkAnswer = useCallback(() => {
    if (!currentProblem) return

    const { num1, num2, operation } = currentProblem
    let correctAnswer: number

    switch (operation) {
      case '+':
        correctAnswer = num1 + num2
        break
      case '-':
        correctAnswer = num1 - num2
        break
      case '*':
        correctAnswer = num1 * num2
        break
      case '/':
        correctAnswer = num1 / num2
        break
    }

    if (Number(answer) === correctAnswer) {
      setScore((prev) => prev + 1)
      setAnswer('')
      generateProblem()
    }
  }, [answer, currentProblem, generateProblem])

  useEffect(() => {
    if (isPlaying && answer) {
      checkAnswer()
    }
  }, [answer, isPlaying, checkAnswer])

  const startGame = () => {
    setIsPlaying(true)
    setScore(0)
    setTimeLeft(timeLimit)
    generateProblem()
  }

  const endGame = () => {
    setIsPlaying(false)
    setCurrentProblem(null)
  }

  const resetGame = () => {
    setIsPlaying(false)
    setCurrentProblem(null)
    setAnswer('')
    setScore(0)
    setTimeLeft(timeLimit)
  }

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      endGame()
    }
  }, [isPlaying, timeLeft])

  const toggleOperation = (op: Operation) => {
    if (operations.includes(op)) {
      setOperations(operations.filter((o) => o !== op))
    } else {
      setOperations([...operations, op])
    }
  }

  return (
    <Box 
      minH="100vh" 
      w="100vw" 
      bg="gray.50" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="center">
          <Heading size="2xl" color="blue.600">Zetamac Clone</Heading>

          {!isPlaying ? (
            timeLeft === 0 ? (
              <Box 
                p={8} 
                bg="white" 
                borderRadius="lg" 
                boxShadow="xl"
                w="100%" 
                maxW="md"
                textAlign="center"
              >
                <Heading size="xl" color="blue.600" mb={4}>Game Over!</Heading>
                <Text fontSize="2xl" fontWeight="bold" color="green.600" mb={6}>
                  Final Score: {score}
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={resetGame}
                  w="200px"
                >
                  Play Again
                </Button>
              </Box>
            ) : (
              <VStack spacing={6} w="100%" maxW="md">
                <Text fontSize="lg" fontWeight="medium">Select Time Limit:</Text>
                <HStack spacing={4}>
                  {([30, 60, 120] as TimeLimit[]).map((time) => (
                    <Button
                      key={time}
                      size="lg"
                      colorScheme={timeLimit === time ? 'blue' : 'gray'}
                      onClick={() => setTimeLimit(time)}
                      w="100px"
                    >
                      {time}s
                    </Button>
                  ))}
                </HStack>

                <Box w="100%">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Maximum Number:</Text>
                  <NumberInput
                    value={maxNumber}
                    min={2}
                    max={100}
                    onChange={(_, value) => setMaxNumber(value)}
                  >
                    <NumberInputField />
                  </NumberInput>
                </Box>

                <Box w="100%">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Operations:</Text>
                  <HStack spacing={4} justify="center">
                    {(['+', '-', '*', '/'] as Operation[]).map((op) => (
                      <Button
                        key={op}
                        size="lg"
                        colorScheme={operations.includes(op) ? 'blue' : 'gray'}
                        onClick={() => toggleOperation(op)}
                        w="60px"
                      >
                        {op}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={startGame}
                  disabled={operations.length === 0}
                  w="200px"
                >
                  Start Game
                </Button>
              </VStack>
            )
          ) : (
            <VStack spacing={6} w="100%" maxW="md">
              <HStack spacing={8} justify="center" w="100%">
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.600">Time Left</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">{timeLeft}s</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.600">Score</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">{score}</Text>
                </Box>
              </HStack>

              <Box 
                p={6} 
                bg="white" 
                borderRadius="lg" 
                boxShadow="md"
                w="100%"
                textAlign="center"
              >
                <Text fontSize="3xl" fontWeight="bold">
                  {currentProblem ? `${currentProblem.num1} ${currentProblem.operation} ${currentProblem.num2} =` : ''}
                </Text>
              </Box>

              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                size="lg"
                autoFocus
                textAlign="center"
                fontSize="xl"
                type="number"
                min="0"
              />
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default App
