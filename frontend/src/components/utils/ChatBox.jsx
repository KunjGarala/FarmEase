import React, { useState, useRef, useEffect } from "react";
import {useSelector} from 'react-redux'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import {socket} from '../../App.jsx'

const Chatbox = ({chatName, roomId}) => {

    const ref1 = useRef(null)
    const ref2 = useRef(null)
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const isLogin = useSelector((state) => state.login.isLogin)
    const user = useSelector((state) => state.login.user) || {username: "viral"}
    const navigate = useNavigate()

    const handleSendMessage = async (e) => {
        e.preventDefault()
        await axios.post('http://localhost:8001/message/put', {sender: user.username, message: input, roomId:String(roomId)})
        .then((res) => {
            if (res.status ==200){
                if (input.trim()) {
                    setMessages([...messages, { message: input, sender: user.username }])
                }
                console.log(res)
                socket.emit('sendMessage', {roomId, message:input, sender:user.username})
                setInput('')
            }
            else{
                console.log('error while sending message')
            }
        })
        .catch((err) => {
            console.log(err)
        })
    };

    useEffect( () => {
        if (!isLogin){
            navigate('/')
        }
         axios.post('http://localhost:8001/message/get', {roomId: roomId})
        .then((res) => {
            if (res.status==200){
                setMessages(res.data.data)
                console.log(res.data.data)
            }
            else{
                console.log('failed to fetch messages')
            }
        })
        .catch((err) => {
            console.log(err)
        })

        console.log(socket)
        socket.emit('join',{room:roomId})

        socket.on('receiveMessage', ({sender, message}) => {
            setMessages((messages) => [...messages, {sender, message}])
        })

        return () => {
            socket.emit('leave',{room:roomId})
        }
        
    }, [])

    useEffect(() => {
        ref1.current.scrollIntoView({behavior: 'auto'})
        ref2.current.scrollIntoView({behavior: 'auto'})
    }, [messages])

    return (

        <div className="flex flex-col w-full max-w-md mx-auto border rounded-lg shadow-md bg-white">
        <div ref={ref2}></div>
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white font-bold text-lg rounded-t-lg">
            {chatName}
        </div>

        {/* Message Area */}
        <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            style={{ maxHeight: "400px" }}
        >
            {messages.map((message, index) => (
            <div
                key={index}
                className={`flex ${
                message.sender === user.username ? "justify-end" : "justify-start"
                }`}
            >
                <div className="max-w-xs">
                {/* Sender's name */}
                {message.sender !== user.username && (
                    <p className="text-xs text-gray-500 mb-1">{message.sender}</p>
                )}
                {/* Message content */}
                <div
                    className={`px-4 py-2 rounded-lg text-sm break-words ${
                    message.sender === user.username
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                >
                    {message.message}
                </div>
                </div>
            </div>
            ))}
            <div ref={ref1}></div>
        </div>

        {/* Input Area */}
        <div className="flex p-4 border-t bg-white">
            <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
            <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700"
            >
            Send
            </button>
        </div>
        </div>

    );
};

export default Chatbox;