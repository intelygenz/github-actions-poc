import React, {useState} from 'react';
import './App.css';
import useAxios from 'axios-hooks'

function App() {

  const [{ data, loading, error }, executeGet] = useAxios(
    {
      url: `http://localhost:4000/greetings`,
      method: 'POST',

    },
    {
      manual: true
    }
  ) 

  const [name, setName] = useState("")

  const fetchData = async () => {
    const response = await executeGet({data: {name}})
    console.log(response)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>POC WORKFLOW DEMO FRONT</h1>
        <h3>Insert your name</h3>
        <input type="text" onChange={(e) => setName(e.target.value)}/>
        {/* Show Loading or Call */}
        { (() => {
          if(loading) return <h3>Loading...</h3>
          else return <button onClick={fetchData}>Call to Back</button>
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
