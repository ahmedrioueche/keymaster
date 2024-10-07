import { SearchPrefs, Settings, User } from "../types/types";

export const apiPromptGemini = async (prompt: string): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({prompt}),
      });
  
      if (!response.ok) {
        throw new Error('Failed to prompt Gemini in api');
      }
  
      const responseData = await response.json();
      
      return responseData;
  
    } catch (error) {
      console.error('Failed to prompt Gemini in api:', error);
      
      return { status: 'error', message: 'An error occurred' };
    }
  }

export const apiInsertUser = async (user: User): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
      const response = await fetch('/api/user/insert-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({user}),
      });
  
      if (!response.ok) {
        throw new Error('Failed to insert user in api');
      }
  
      const responseData = await response.json();
      
      return responseData;
  
    } catch (error) {
      console.error('Failed to insert user in api:', error);
      
      return { status: 'error', message: 'An error occurred' };
    }
  }
  
  export const apiAuthenticateUser = async (user: User): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/user/auth-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({user}),
        });
    
        if (!response.ok) {
          throw new Error('Failed to authenticate user in api');
        }
    
        const responseData = await response.json();
        
        return responseData;
    
      } catch (error) {
        console.error('Failed to authenticate user in api:', error);
        
        return { status: 'error', message: 'An error occurred' };
      }
    }

  export const apiGetUsers = async (): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/user/get-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
    
        if (!response.ok) {
          throw new Error('Failed to get users in api');
        }
    
        const responseData = await response.json();
        return responseData;
    
      } catch (error) {
        console.error('Failed to get users in api:', error);
        
        return { status: 'error', message: 'An error occurred' };
      }
  }

  
  export const apiUpdateUser = async (id : number, data: Partial<User>): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/user/update-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({id, data}),
        });
    
        if (!response.ok) {
          throw new Error('Failed to update user in api');
        }
    
        const responseData = await response.json();
        return responseData;
    
      } catch (error) {
        console.error('Failed to update user in api:', error);
        
        return { status: 'error', message: 'An error occurred' };
      }
  }
  
  export const apiSetSettings = async (id : number, settings: Partial<Settings>): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/user/set-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({id, settings}),
        });
    
        if (!response.ok) {
          throw new Error("Failed to set user's settings in api");
        }
    
        const responseData = await response.json();
        return responseData;
    
      } catch (error) {
        console.error("Failed to set user's settings in api:", error);
        
        return { status: 'error', message: 'An error occurred' };
      }
  }

  
  export const apiFindOpponent = async (user: User, searchPrefs: SearchPrefs | undefined): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/search/search-opp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({user, searchPrefs}),
        });
    
        if (!response.ok) {
          throw new Error("Failed to find opponent in api");
        }
    
        const responseData = await response.json();
        return responseData;
    
      } catch (error) {
        console.error("Failedto find opponent in api:", error);
        
        return { status: 'error', message: 'An error occurred' };
      }
  }
  
  export const apiJoinRoom = async (roomId : string, user: User): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/room/join-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({roomId, user}),
        });
    
        if (!response.ok) {
          throw new Error("Failed to join room in api");
        }
    
        const responseData = await response.json();
        return responseData;
    
      } catch (error) {
        console.error("Failedto join room in api:", error);
        
        return { status: 'error', message: 'An error occurred' };
      }
  }
  
  export const apiCreateRoom = async (roomId : string, user: User): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/room/create-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({roomId, user}),
        });
    
        if (!response.ok) {
          throw new Error("Failed to create room in api");
        }
    
        const responseData = await response.json();
        return responseData;
    
      } catch (error) {
        console.error("Failed to create room in api:", error);
        
        return { status: 'error', message: 'An error occurred' };
      }
  }

  export const apiPusherSendMessage = async (roomId : string, event: string, message: string, user : User | null): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
        const response = await fetch('/api/pusher/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({roomId, event, message, user}),
        });
    
        if (!response.ok) {
          throw new Error("Failed to send message in api");
        }
    
        const responseData = await response.json();
        return responseData;
    
      } catch (error) {
        console.error("Failed to send message in api:", error);
        
        return { status: 'error', message: 'An error occurred' };
      }
  }


  