import express from 'express'

const app = express()


app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});



app.listen(3000, () => {
  console.log("Sevrver running")
})
