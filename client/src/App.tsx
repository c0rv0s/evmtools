import { useState } from "react";
import "./App.css";
import "antd/dist/antd.css";
import { Button, Input, Checkbox } from "antd";
const { TextArea } = Input;

function App() {
  const [encode, setEncode] = useState(true);
  const [structs, setStructs] = useState(false);
  const [api, setApi] = useState(false);
  const [structAargs, setStructArgs] = useState("");
  const [signature, setSignature] = useState("");
  const [params, setParams] = useState("");
  const [target, setTarget] = useState("");
  const [sigOnly, setSigOnly] = useState(false);

  const [winningFunction, setWinningFunction] = useState([]);
  const [winningType, setWinningType] = useState([]);
  const [encoded, setEncoded] = useState("");
  const [error, setError] = useState(false);

  const getStruct = async () => {
    setError(false);
    const structParams = structAargs.trim()
      .split(";")
      .flatMap((x: string) => (x ? (x + ";").trim() : []));

    fetch("/api/pack_structs?struct=" + JSON.stringify(structParams))
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error:", error);
          setError(true);
          setWinningFunction([]);
          setWinningType([]);
        } else {
          setWinningFunction(data.winning_order_function);
          setWinningType(data.winning_order_type);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(true);
        setWinningFunction([]);
        setWinningType([]);
      });
  };

  const encodingCall = () => {
    setError(false);
    if (sigOnly) getSignature();
    else getEncoding();
  };

  const getEncoding = () => {
    const p = params.split(",").map((p: string) => p.trim());
    fetch(
      "/api/encode?signature=" +
        signature.trim() +
        "&params=" +
        JSON.stringify(p) +
        "&address=" +
        target
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data);
        const dataString = `
        <b>Contract address:</b> ${data.data.address}\n
        <b>Function selector:</b> ${data.data.functionSignature}\n
        <b>Params:</b> ${data.data.encodedParams
          .map(
            (param: any) => `
          <b>Type:</b> ${param.type}
          <b>Value:</b> ${param.value}
          <b>Encoding:</b> ${param.encoded}
        `
          )
          .join("\n")}
        <b>Full encoding:</b> ${data.data.script}
        `;
        setEncoded(dataString);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(true);
        setEncoded("");
      });
  };

  const getSignature = () => {
    fetch("/api/encode?signature=" + signature.trim())
      .then((response) => response.json())
      .then((data) => {
        const dataString = `
        <b>Full encoding (event topic[0]):</b> ${data.data}\n
        <b>First 4 bytes (solidity custom error):</b> ${data.data.slice(0, 10)}
        `;
        setEncoded(dataString);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(true);
        setEncoded("");
      });
  };

  return (
    <div className="App">
      <h1>EVM Tools</h1>
      <span
        className="page"
        style={{
          textDecoration: encode ? "underline" : "none",
        }}
        onClick={() => {
          setEncode(true);
          setStructs(false);
          setApi(false);
        }}
      >
        Encode EVM Data
      </span>
      <span
        className="page"
        style={{
          textDecoration: structs ? "underline" : "none",
        }}
        onClick={() => {
          setEncode(false);
          setStructs(true);
          setApi(false);
        }}
      >
        Optimize Solidity Structs
      </span>
      <span
        className="page"
        style={{
          textDecoration: api ? "underline" : "none",
        }}
        onClick={() => {
          setEncode(false);
          setStructs(false);
          setApi(true);
          setError(false);
        }}
      >
        API Usage
      </span>

      <br />
      <br />

      {encode && (
        <div>
          Encode an EVM function call
          <Input
            placeholder="Function signature, i.e. vote(uint,string)"
            className="inputs"
            value={signature}
            onChange={(e) => setSignature(e.target.value.replace(/\s/g, ""))}
          />
          <Checkbox
            onChange={(e) => setSigOnly(e.target.checked)}
            checked={sigOnly}
          >
            Signature only (for event signatures or error codes)
          </Checkbox>
          <Input
            placeholder="Params (comma separated)"
            className="inputs"
            disabled={sigOnly}
            value={params}
            onChange={(e) => setParams(e.target.value)}
          />
          <Input
            placeholder="Target contract address"
            className="inputs"
            disabled={sigOnly}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <br />
          <br />
          <Button type="primary" onClick={encodingCall}>
            Encode
          </Button>
          <br />
          <br />
          <div
            className="output"
            dangerouslySetInnerHTML={{ __html: encoded }}
          />
        </div>
      )}

      {structs && (
        <div>
          Determine the optimal arrangement of struct parameters
          <TextArea
            className="inputs"
            rows={4}
            placeholder="uint arg1; string arg2; bytes arg3; ..."
            value={structAargs}
            onChange={(e) => setStructArgs(e.target.value)}
          />
          <br />
          <br />
          <Button type="primary" onClick={getStruct}>
            Optimize
          </Button>
          <br />
          <br />
          <div className="output">
            {winningFunction.length > 0 && (
              <div>
                <b>Winning Order Function:</b>
                {winningFunction.map((s) => (
                  <div>
                    {s} <br />
                  </div>
                ))}
              </div>
            )}
          </div>
          <br />
          <br />
          <div className="output">
            {winningType.length > 0 && (
              <div>
                <b>Winning Order Type:</b>
                {winningType.map((s) => (
                  <div>
                    {s} <br />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {api && (
        <div>
          Example API usage:
          <p>Encode data:</p>
          <a href="https://evm.tools/api/encode?signature=voteFor(uint)&params=[12]&address=0xBa37B002AbaFDd8E89a1995dA52740bbC013D992">
            https://evm.tools/api/encode?signature=voteFor(uint)&params=[12]&address=0xBa37B002AbaFDd8E89a1995dA52740bbC013D992
          </a>
          <br />
          <br />
          <p>Encode event signature:</p>
          <a href="https://evm.tools/api/encode?signature=Voted(uint)">
            https://evm.tools/api/encode?signature=Voted(uint)
          </a>
          <br />
          <br />
          <p>Pack structs:</p>
          <a href='https://evm.tools/api/pack_structs?struct=["uint nums;", "string name;", "bytes something;"]'>
            https://evm.tools/api/pack_structs?struct=["uint nums;", "string
            name;", "bytes something;"]
          </a>
        </div>
      )}
      <br />
      <br />
      {error && (
        <span className="error">There was an error in your inputs</span>
      )}
    </div>
  );
}

export default App;
