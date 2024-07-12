const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;


const WINDOW_SIZE = 10;
const BASE_URL = "http://localhost:9876/api/";  
const TIMEOUT = 500;  


let numbersStorage = [];


const fetchNumbersFromAPI = async (numberId) => {
    try {
        const response = await axios.get(`${BASE_URL}${numberId}`, { timeout: TIMEOUT });
        if (response.status === 200) {
            return response.data.numbers;
        }
    } catch (error) {
        return null;
    }
    return null;
};

const addUniqueNumbers = (newNumbers) => {
    let uniqueNumbers = [...new Set([...numbersStorage, ...newNumbers])];
    if (uniqueNumbers.length > WINDOW_SIZE) {
        uniqueNumbers = uniqueNumbers.slice(-WINDOW_SIZE);
    }
    return uniqueNumbers;
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) {
        return 0.0;
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

// Endpoint
app.get('/numbers/:numberId', async (req, res) => {
    const { numberId } = req.params;
    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const prevState = [...numbersStorage];

    const newNumbers = await fetchNumbersFromAPI(numberId);
    if (newNumbers === null) {
        return res.status(500).json({ error: 'Failed to fetch numbers' });
    }

    numbersStorage = addUniqueNumbers(newNumbers);

    const currState = [numbersStorage];
    const average = calculateAverage(numbersStorage);

    const response = {
        windowPrevState: prevState,
        windowCurrState: currState,
        numbers: newNumbers,
        avg: parseFloat(average.toFixed(2))
    };
    res.json(response);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
