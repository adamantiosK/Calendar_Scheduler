import { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State to track saving operation
  const [apiKey, setApiKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(false);
      if (session) {
        setLoggedIn(true);
        setUserId(session.user.id); // Store the user ID upon login
        await fetchOrCreateOrUpdateApiKey(session.user.id, apiKey, false);
      } else {
        setLoggedIn(false);
        setApiKey('');
        setUserId(''); // Clear user ID upon logout
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateOrUpdateApiKey = async (userId: string, newApiKey: string = '', update = false) => {
    if (update) {
      setSaving(true); // Begin saving operation
      const { error } = await supabase
        .from('user_api_keys')
        .update({ api_key: newApiKey })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating API key:', error);
      }
      setSaving(false); // End saving operation
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
      setSaving(false); // End saving operation
    }
  };

  const handleSaveApiKey = async () => {
    if (userId) { // Use stored userId for saving the API key
      await fetchOrCreateOrUpdateApiKey(userId, apiKey, true);
    } else {
      console.error("No user session found.");
    }
  };

  const handleLogin = async () => {
    let { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error logging in:', error);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      setLoggedIn(false);
      setApiKey('');
      setUserId(''); // Clear user ID upon logout
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>ToDoIst + IOS Calendar Integration</h1>
      {loggedIn ? (
        <>
          <div>You are logged in.</div>
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
            {saving && <span className="loader"></span>} {/* Display loading icon when saving */}
          </div>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
}

export default App;
