import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Footer from './components/Footer';
import { useSnackbar } from 'notistack';
import { FaEye, FaPaperPlane , FaCuttlefish, FaGoogle} from 'react-icons/fa'

const socket = io.connect('http://localhost:3000/');

const App = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('Anonymous');
  const [room, setRoom] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [isTyping, setTyping] = useState(false);
  const [typer, settyper] = useState('');
  const [a1 , setA1] = useState(true);
  const [indi, setIndi] = useState(false);
  const [trans, setTrans] = useState('');

  const {enqueueSnackbar} = useSnackbar();


  function sendMessage() {
    const currentTime = new Date().toLocaleTimeString();
    setA1(false);
    setIndi(false);
    socket.emit('send_message', { message, room, name, time: currentTime });
    setMessage('');
    document.getElementsByClassName('vimer')[0].value = '';
    let newLi = document.createElement('li');
    newLi.style.marginLeft = '60vw'
    newLi.style.border = '1px solid white';
    newLi.innerHTML = `${message} &nbsp; <span>You</span>  &nbsp; <span style={{color: 'green'}}>${currentTime}</span>`
    newLi.className = 'under1';
    let xyz = document.getElementsByClassName('under')[0]
    xyz.appendChild(newLi);
    
    setTyping(false);
    const {bottom} = xyz.getBoundingClientRect();
    if(bottom > (window.innerHeight-200)) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setA1(false);
      const currentTime = new Date().toLocaleTimeString();
      setUserCount(data.noOfUsers-1);
      let newLi = document.createElement('li');
      newLi.style.border = '1px solid white';
      newLi.style.marginLeft = '5vw'
      newLi.innerHTML = `${data.msg} &nbsp;&nbsp; <span>${data.username}</span> &nbsp;&nbsp; <span style={{color: 'green'}}>${currentTime}</span>`;
      newLi.className = 'under2';
      let xyz = document.getElementsByClassName('under')[0];
      xyz.appendChild(newLi);
      const {bottom} = xyz.getBoundingClientRect();
        if(bottom > (window.innerHeight-200)) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      })
    }
    });

    socket.on('heIsTyping', (data) => {
      console.log(data)
      settyper(data.name) 
      setTyping(data.status)
      setIndi(false);
    }
    )

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  function joinRoom() {
    try {
      if (room) {
        socket.emit('join_room', room);
        enqueueSnackbar('Room joined successfully', {variant: 'success'})
      } else {
       enqueueSnackbar('Please enter a valid room', {variant: 'warning'})
      }
    } catch (err) {
      enqueueSnackbar('An error occurred while joining', {variant: 'error'});
    }
  }

  function handleChat() {
    enqueueSnackbar('Chatting as '+ name, {variant : 'success'} )
  }

  function handleKey(e) {

     if(e.key == 'Enter') {
      sendMessage();
      return ;
     }

  }

  async function handleTranslate() {
    
    let siu = message;
    setMessage('Translating...');
    document.getElementsByClassName('vimer')[0].style.color = 'rgba(0,0,0,0.4)'

    if(trans == '') {
      enqueueSnackbar('Please select a language', {variant: 'warning'})
      return ;
    }

    const url = 'https://google-translate1.p.rapidapi.com/language/translate/v2';
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'application/gzip',
        'X-RapidAPI-Key': '51668fc146mshd911feb542037b9p17bc7bjsn4a57544f7405',
        'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
      },
      body: new URLSearchParams({
        q: `${message}`,
        target: `${trans}`,
        source: 'en'
      })
    };
  
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      document.getElementsByClassName('vimer')[0].style.color = 'rgba(0,0,0)';
      setMessage(data.data.translations[0].translatedText);
      console.log(data.data.translations[0].translatedText);
    } catch (error) {
      console.error('Error:', error);
      setMessage(siu);
     enqueueSnackbar('Failed to load translations, try again later...', {variant: 'error'});
    }
  }
  
  return (
    <div>
      <div className='header'>
        <h1>WartaLaap <FaCuttlefish /></h1>
        <div className='chaat'>
          <input type='text' placeholder='name...' className='chatAs' onChange={ (e) => setName(e.target.value)}/>
          <button className='btn btn-secondary p-3 chatAs1' onClick={handleChat}>
            Start Chat
          </button>
        </div>
      </div>
      <div className='options'>
       <div className="op">
       <input type='text' placeholder='room no...' onChange={(e) => setRoom(e.target.value)} /> &nbsp; &nbsp;
        <button onClick={joinRoom} className='btn btn-primary p-2' style={{marginBottom:'1rem'}}>
          Join room
        </button>
       </div>
        <br />
        
        <div className="bhasha">
        <div class="custom-dropdown">
  <div className="dropdown-button"><h3>Translate <FaGoogle size={20}/></h3></div>
  <div className="dropdown-content">
    <div className="dropdown-option" onClick={() => 
      {
        setTrans('hi'); enqueueSnackbar( 'Language selected', {variant: 'info'})
      }}><h1>Hindi</h1></div>
    <div className="dropdown-option" onClick={() => {
      setTrans('fr'); enqueueSnackbar('Language selected', {variant:'info'});
    }}><h1>French</h1></div>
    <div className="dropdown-option" onClick={() => {
      setTrans('es'); enqueueSnackbar('Language selected', {variant:'info'});
    }}><h1>Spanish</h1></div>
    <div className="dropdown-option" onClick={() => {
       setTrans('en'); enqueueSnackbar('Language selected', {variant:'info'})
    }}><h1>English</h1></div>
  </div>
  
</div>
<button onClick={handleTranslate} >Translate</button>
        </div>

        <h2 style={{marginLeft:'70vw', marginTop:'10px', position:'absolute'}}>&nbsp;<FaEye size={30}/>  {userCount}</h2>
      </div>
     <div className="bor">
     <div className='dablu'>
        
        <ul className='under'> 
        { a1 && <h2 style={{opacity:'30%'}}>Your messages will appera here...</h2>}
        </ul>
        {(indi) ? '' : isTyping && <h3 style={{position:'absolute', marginLeft:'5vw'}}>{typer}&nbsp; is typing...</h3>}
      </div>
      <div className="options options1" >
      <input type='text' style={{borderRadius:'30px', width:'50vw', }}    value={message} className='vimer'  placeholder='message...' onKeyDown={handleKey}
         onChange={(e) => {
          setMessage(e.target.value)
          setIndi(true);
          const inputValue = e.target.value;
  if (inputValue !== '') {
    setTyping(true);
    // Emit 'typing' event immediately
    socket.emit('typing', { room, name, isTyping: true });
    
    // Set a timer for 2 seconds to emit 'typing' event with isTyping as false
    const timerId = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', { room, name, isTyping: false });
    }, 2000);
    
    // Clear the timer if the user starts typing again within 2 seconds
    // This prevents the previous timer from triggering the event if the user continues typing
    return () => clearTimeout(timerId);
  } else {
    setTyping(false);
    // Emit 'typing' event immediately
    socket.emit('typing', { room, name, isTyping: false });
  }
           
        }}
        />{' '}
        &nbsp; &nbsp;
        <button onClick={sendMessage} className='btn btn-primary p-3 paper' >
          <FaPaperPlane size={25}/>
        </button>
      </div>
     </div>
     <Footer />
    </div>
  );
};

export default App;
