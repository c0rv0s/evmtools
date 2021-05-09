import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Button, Input } from 'antd';
const { TextArea } = Input;

function App() {
  const [encode, setEncode] = useState(false)
  const [structs, setStructs] = useState(false)
  const [structAargs, setStructArgs] = useState('')
  const [signature, setSignature] = useState('')
  const [params, setParams] = useState('')
  const [target, setTarget] = useState('')

  const [structed, setStructed] = useState([])
  const [encoded, setEncoded] = useState('')
  const [error, setError] = useState(false)

  const getStruct = async () => {
    setError(false)
    const structParams = structAargs.split(';').flatMap(x => x ? (x + ';').trim() : [])

    fetch("/api/pack_structs?struct=" + JSON.stringify(structParams))
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error:', error);
        setError(true)
        setStructed([])
      } else {
        setStructed(data.winning_order_function)
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      setError(true)
      setStructed([])
    });
  }

  const getEncoding = () => {
    setError(false)
    const p = params.split(",").map((p: string) => p.trim())
    fetch("/api/encode?signature=" + signature.trim() + "&params=" + JSON.stringify(p) + "&address=" + target)
    .then(response => response.json())
    .then(data => {
      setEncoded(data.data)
    })
    .catch((error) => {
      console.error('Error:', error);
      setError(true)
      setEncoded('')
    });
  }

  return (
    <div className="App">
      <h1>EVM Tools</h1>
      <span className="page" onClick={() => { 
        setEncode(false)
        setStructs(true)
      }}>Optimize Solidity Structs</span>
      <span className="page" onClick={() => { 
        setEncode(true)
        setStructs(false)
      }}>Encode EVM Data</span>

      <br />
      <br />

      {
        structs && (
          <div>
            Determine the optimal arrangement of struct parameters
            <TextArea
              className="inputs"
              rows={4} 
              placeholder="uint arg1; string arg2; bytes arg3; ..."
              value={structAargs}
              onChange={(e) => setStructArgs(e.target.value)}
            />
            <br/>
            <br/>
            <Button type="primary" onClick={getStruct}>Optimize</Button>
            <br/>
            <br/>
            <div className="output">{
              structed.map(s => (
                <div>{s} <br/></div>
              ))
            }</div>
          </div>
        )
      }
      {
        encode && (
          <div>
            Encode an EVM function call
            <Input placeholder="Signature" className="inputs" value={signature} onChange={(e) => setSignature(e.target.value)}/>
            <Input placeholder="Params (comma seperated)" className="inputs" value={params} onChange={(e) => setParams(e.target.value)}/>
            <Input placeholder="Target address" className="inputs" value={target} onChange={(e) => setTarget(e.target.value)}/>
            <br/>
            <br/>
            <Button type="primary" onClick={getEncoding}>Encode</Button>
            <br/>
            <br/>
            <div className="output">{encoded}</div>
          </div>
        )
      }
      <br/>
      <br/>
      {
        error && (
          <span className="error">There was an error in your inputs</span>
        )
      }
    </div>
  );
}

export default App;
