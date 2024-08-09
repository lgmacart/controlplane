import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())

let agents = []

app.post("/register", (req, res) => {
    console.log(req.body)
    let agentInfo = {
        name: req.body.name,
        id: agents.length
    }

    agents.push(agentInfo)

    res.send(JSON.stringify(agentInfo))
})

app.get("/agents", (req, res) => {
    console.log(agents)
    res.send(JSON.stringify(agents))
})

app.get("/greeting", (req, res) => {
    res.send("Hello!")
})

app.post("/exec", async (req, res) => {
    /*
        id = [],
        command
    */
    let outputs = []

    for(let i = 0; i < req.body.id.length; i++) {
        let name = agents.find(a => a.id === req.body.id[i])?.name ?? null

        if(!name) {
            outputs.push({
                id: req.body.id[i],
                name,
                output: null
            })
            continue
        }

        try {
            let outputResponse = await fetch(`http://${name}:2324/run`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    command: req.body.command
                })
            })

            if(outputResponse.status !== 200) {
                outputs.push({
                    id: req.body.id[i],
                    name,
                    output: null
                })
                continue
            }

            let output = await outputResponse.text()

            outputs.push({
                id: req.body.id[i],
                name,
                output
            })
        }
        catch(error) {
            outputs.push({
                id: req.body.id[i],
                name,
                output: null
            })
            continue
        }
    }

    res.json({outputs})
})

app.listen(2323, () => {
    console.log("listening")
})