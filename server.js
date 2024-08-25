const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git'); // Import simple-git

const app = express();
const port = 3000;
const dataFile = path.join(__dirname, 'songs.json');
const git = simpleGit(); // Khởi tạo simple-git

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Đọc dữ liệu từ file JSON
const readData = () => {
    const jsonData = fs.readFileSync(dataFile);
    return JSON.parse(jsonData);
};

// Lưu dữ liệu vào file JSON và commit
const writeData = (data) => {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    commitAndPushChanges(); // Gọi hàm commit và push sau khi lưu dữ liệu
};

// Commit và push các thay đổi lên GitHub
const commitAndPushChanges = () => {
    git.add(dataFile)
    .then(() => git.commit("Update songs.json"))
    .then(() => git.push('origin', 'master')) // Thay đổi từ 'main' thành 'master'
    .catch(err => console.error('Failed to commit and push changes:', err));
};

// GET tất cả bài hát
app.get('/music', (req, res) => {
    res.json(readData());
});

// POST tạo mới bài hát
app.post('/music', (req, res) => {
    const data = readData();
    const newItem = req.body;
    newItem.id = data.length + 1;
    data.push(newItem);
    writeData(data);
    res.status(201).json(newItem);
});

// PUT cập nhật bài hát
app.put('/music/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id, 10);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
        data[index] = {
            ...data[index],
            ...req.body
        };
        writeData(data);
        res.json(data[index]);
    } else {
        res.status(404).send('Not Found');
    }
});

// DELETE xóa bài hát
app.delete('/music/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id, 10);
    const newData = data.filter(item => item.id !== id);
    if (data.length !== newData.length) {
        writeData(newData);
        res.status(204).send();
    } else {
        res.status(404).send('Not Found');
    }
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});