import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import axios from 'axios';
import Chart from '../components/chart';

const App = () => {

  const [token, setToken] = useState('');
  const [data, setData] = useState<any[]>([]);

  const getTokens = () => {
    
    let params = 
      queryString.parse(window.location.hash);
    
    return params;
  }

  useEffect(() => {
    let params = getTokens();

    if (!Object.keys(params).includes('access_token')) return;

    
    setToken(params.access_token?.toString() ?? '');

    let header = {
      'Authorization': 'Bearer ' + params.access_token?.toString()
    }

    axios.get('https://api.spotify.com/v1/me/top/artists?limit=25', { headers: header })
      .then(res => {
        console.log(res.data.items);
        
        setData(res.data.items);
      });
  }, []);

  return (
    <>
    {
      data ? <Chart data={data} /> : null
    }
    </>
  );
};

export default App;
