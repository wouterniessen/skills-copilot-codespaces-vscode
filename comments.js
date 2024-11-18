// Create web server
// Create a web server that can respond to requests for comments
// and can save new comments to a file.
// The server should respond to the following requests:
// - GET /comments: return a list of comments.
// - POST /comments: create a new comment.
// The comments should be saved to a file called comments.json.
// This file should be created if it does not exist.
// The comments should be stored in the file as an array of strings.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const COMMENTS_FILE = path.join(__dirname, 'comments.json');

function readComments(callback) {
    fs.readFile(COMMENTS_FILE, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                callback(null, []);
            } else {
                callback(err);
            }
            return;
        }
        try {
            const comments = JSON.parse(data);
            callback(null, comments);
        } catch (e) {
            callback(e);
        }
    });
}

function writeComments(comments, callback) {
    fs.writeFile(COMMENTS_FILE, JSON.stringify(comments), callback);
}

const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url);
    if (pathname === '/comments') {
        if (req.method === 'GET') {
            readComments((err, comments) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                    return;
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(comments));
            });
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                readComments((err, comments) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                        return;
                    }
                    comments.push(body);
                    writeComments(comments, err => {
                        if (err) {
                            res.statusCode = 500;
                            res.end('Internal Server Error');
                            return;
                        }
                        res.end();
                    });
                });
            });
        } else {
            res.statusCode = 405;
            res.end('Method Not Allowed');