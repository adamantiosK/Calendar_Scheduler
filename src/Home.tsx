import { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import TodoistProjects from './TodoistProjects';
import axios from 'axios';
import todoistLogo from './assets/todoist-icon.png';
import iosCalendarLogo from './assets/iosCalendar-icon.png';
import aiLogo from './assets/ai-icon.webp';

function Home() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  const [apiKey, setApiKey] = useState('');
  const [validApiKey, setValidApiKey] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(false);
      if (session) {
        setLoggedIn(true);
        setUserId(session.user.id); 
        await fetchOrCreateOrUpdateApiKey(session.user.id, apiKey, false);
      } else {
        setLoggedIn(false);
        setApiKey('');
        setUserId(''); 
        setValidApiKey(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkTodoistApiKeyValidity = async (apiKey: string) => {
    try {
      await axios.get('https://api.todoist.com/rest/v2/projects', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      setValidApiKey(true);
      return true;
    } catch (error) {
      setValidApiKey(false);
      return false;
    }
  };

  const fetchOrCreateOrUpdateApiKey = async (userId: string, newApiKey: string = '', update = false) => {
    if (update) {
      setSaving(true); 
      setValidApiKey(false);
      const { error } = await supabase
        .from('user_api_keys')
        .update({ api_key: newApiKey })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating API key:', error);
      }
      setSaving(false); 

      return;
    }

    let { data, error, status } = await supabase
      .from('user_api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .single();

    if (error && status !== 406) {
      console.error('Error fetching API key:', error);
      return;
    }

    if (data) {
      setApiKey(data.api_key);
      setValidApiKey(true);
    } else {
      setSaving(true); // Assume saving operation for consistency
      const { error: insertError } = await supabase
        .from('user_api_keys')
        .insert([{ user_id: userId, api_key: 'Empty ToDoIst API Key' }]);

      if (insertError) {
        console.error('Error creating API key entry:', insertError);
      } else {
        setApiKey('Your default or empty API key here');
      }
      setSaving(false); 
    }
  };

  const handleSaveApiKey = async () => {

    if (await checkTodoistApiKeyValidity(apiKey)) {
      if (userId) { 
        await fetchOrCreateOrUpdateApiKey(userId, apiKey, true);
      } else {
        console.error("No user session found.");
      }
    } else {
      setApiKey('Wrong Api Key');
    }
  };

  const handleLogin = async () => {
    let { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error logging in:', error);
  };

  const handleLogout = async () => {
    setLoggedIn(false);
    setApiKey('');
    setUserId('');
    setValidApiKey(false);

    await supabase.auth.signOut();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={todoistLogo}
          alt="ToDoist Logo"
          style={{ width: '100px', marginRight: '20px' }} 
        />
        <span style={{ fontSize: '70px', marginRight: '20px' }}>+</span>
        <img
          src={iosCalendarLogo}
          alt="iOS Calendar Logo"
          style={{ width: '120px', marginRight: '20px' }} 
        />
        <span style={{ fontSize: '70px', marginRight: '20px' }}>+</span>
        <img
          src={aiLogo}
          alt="AI Robot Image"
          style={{ width: '110px', background: 'transparent' }} 
        />
      </div>
      <div style={{ marginTop: '60px' }}>
        {loggedIn ? (
          <>
            <button onClick={handleLogout}>Logout</button>
            <div>
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API Key"
              />
              <button onClick={handleSaveApiKey} disabled={saving}>
                Save ToDoIst API Key
              </button>
              {saving && <span className="loader"></span>}
            </div>
            {validApiKey ?
              <TodoistProjects api_token={apiKey} user_id={userId}  /> : <div></div>
            }
          </>
        ) : (
          <button onClick={handleLogin}>Login with Google</button>
        )}
      </div>
    </div>
  );
}

export default Home;