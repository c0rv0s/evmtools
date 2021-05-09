import express, { json } from "express"
import { encodeEvmScript } from "./evm-script-encoder"
import axios from "axios"
import path from "path"

const app = express()
const port = 4000

// start the Express server
app.listen(port, () => {
  // tslint:disable:no-console
  console.log(`App listening at http://localhost:${port}`)
})

app.get("/api/pack_structs", async function(req: any, res: any) {
  axios.get("http://127.0.0.1:5000/api/pack_structs", { params: { struct: req.query.struct } })
  .then((packed) => {
    res.send(packed.data)
  })
})

app.get("/api/encode", function(req: any, res: any) {
  const data = encodeEvmScript(req.query.signature, JSON.parse(req.query.params), req.query.address)
  res.send({ data })
})

// serve the static build of the front end
app.use('/', express.static(path.join(__dirname, '../../client/build')))
