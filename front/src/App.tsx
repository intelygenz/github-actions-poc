import React from 'react';
import './App.css';
import useAxios from 'axios-hooks'

function App() {
  const [{ data, loading, error }, executeGet] = useAxios(
    {
      url: 'http://localhost:4000',
      method: 'GET'
    },
    {
      manual: true
    }
  ) 

  const fetchData = async () => {
    const response = await executeGet()
    console.log(response)
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>POC WORKFLOW DEMO FRONT</h1>
        {/* Show Loading or Call */}
        { (() => {
          if(loading) return <h3>Loading...</h3>
          else return <a onClick={fetchData}>Call to Back</a>
        })()}
        {/* Show data or error */}
        { (() => {
          if(error) return <h3 className={'text-red'}>{error}</h3>
          else return <h3>{JSON.stringify(data)}</h3>
        })()}
      </header>
    </div>
  );
}

export default App;
