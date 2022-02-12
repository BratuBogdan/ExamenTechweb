'use strict'
require('dotenv').config({})
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Op } = require('sequelize')
const port = 8080
const app = express()
const sequelize = require('./sequelize')
const Participant = require('./entities/participant')
const Meeting = require('./entities/meeting')

Meeting.hasMany(Participant)

app.use(cors())
app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())
app.use(express.json())

app.use((req, res, next) => {
  console.log('Requested ' + req.url)
  next()
})
app.get('/', (req, res) => {
  res.status(200).send('ok')
})
app.use((err, req, res, next) => {
  console.error('[ERROR]:' + err)
  res.status(500).json({ message: '500 - Server Error' })
})

app.get('/sync', async (req, res) => {
  try {
    await sequelize.sync({ force: true })
    res.status(201).send('database refresh!')
  } catch (error) {}
})

//POST Meeting
app.post('/meeting', async (req, res, next) => {
  try {
    await Meeting.create(req.body)
    res.status(201).json({ message: 'Meeting Created!' })
  } catch (err) {
    next(err)
  }
})

//GET all Meetings
app.get('/meeting', async (req, res, next) => {
  try {
    if (req.query.desc && req.query.site) {
      const meeting = await Meeting.findAll({
        where: {
          descriere: req.query.desc,

          url: {
            [Op.substring]: req.query.site,
          },
        },
      })
      if (meeting.length !== 0) {
        res.status(201).json(meeting)
      } else {
        res
          .status(404)
          .json({ message: 'No Meetings found using these filters!' })
      }
    } else {
      const meeting = await Meeting.findAll()
      res.status(200).json(meeting)
    }
  } catch (err) {
    next(err)
  }
})

//Get a meeting
app.get('/meeting/:MID', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.MID)
    if (meeting) {
      res.status(200).json(meeting)
    } else {
      res.status(404).send('Meeting not found!')
    }
  } catch (err) {
    next(err)
  }
})

//PUT Meeting
app.put('/meeting/:meetingId', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId)
    if (meeting) {
      await meeting.update(req.body, {
        fields: ['descriere', 'url', 'date'],
      })
      res.status(202).send('Meeting updated!')
    } else {
      res.status(404).send('meeting not found')
    }
  } catch (err) {
    next(err)
  }
})

//DELETE Meeting
app.delete('/meeting/:meetingId', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId)
    if (meeting) {
      await meeting.destroy()
      res.status(202).send('Meeting deleted!')
    } else {
      res.status(404).send('meeting not found')
    }
  } catch (err) {
    next(err)
  }
})

//GET all participants
app.get('/participant', async (req, res, next) => {
  try {
    const participant = await Participant.findAll()
    res.status(200).json(participant)
  } catch (err) {
    next(err)
  }
})

//GET one Participant
app.get('/meeting/:meetingId/participant/:PID', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId)
    if (meeting) {
      const participant = await Participant.findByPk(req.params.PID)
      if (participant) {
        res.status(200).json(participant)
      } else {
        res.status(404).json({ message: '404 - Participant Not Found!' })
      }
    } else {
      res.status(404).json({ message: '404 - Meeting Not Found!' })
    }
  } catch (err) {
    next(err)
  }
})

//Get All Participants from Meeting
app.get('/meeting/:meetingId/participant', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId)
    if (meeting) {
      const participant = await Participant.findAll({
        where: {
          MeetingId: req.params.meetingId,
        },
      })
      if (participant.length !== 0) {
        //req.query.minimumSpeed si req.query.

        res.status(201).json(participant)
      } else {
        res.status(404).json({ message: '404 - Participants Not Found!' })
      }
    } else {
      res.status(404).json({ message: '404 - Meeting Not Found!' })
    }
  } catch (err) {
    next(err)
  }
})

//POST Participant
app.post('/meeting/:meetingId/participant', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId)
    if (meeting) {
      const participant = new Participant(req.body)
      participant.MeetingId = req.params.meetingId
      await participant.save()
      res.status(201).json({ message: 'Participant added' })
    } else {
      res.status(404).json({ message: '404 - Meeting Not Found!' })
    }
  } catch (err) {
    next(err)
  }
})

//PUT Participant
app.put('/meeting/:meetingId/participant/:aID', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId)
    if (meeting) {
      const participant = await Participant.findByPk(req.params.aID)
      if (participant) {
        await participant.update(req.body, {
          fields: ['name'],
        })
        res.status(202).send('Participant updated!')
      } else {
        res.status(404).send('Participant not found')
      }
    } else {
      res.status(404).send('Apacecraft not found')
    }
  } catch (err) {
    next(err)
  }
})

//DELETE Participant
app.delete('/meeting/:meetingId/participant/:aID', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId)
    if (meeting) {
      const participant = await Participant.findByPk(req.params.aID)
      if (participant) {
        await participant.destroy()
        res.status(202).send('Participant fired!')
      } else {
        res.status(404).send('Participant not found')
      }
    } else {
      res.status(404).send('Apacecraft not found')
    }
  } catch (err) {
    next(err)
  }
})

app.listen(port, async () => {
  console.log('Running on port: ' + port)
  try {
    await sequelize.authenticate()
    console.log('Connection has been estabilshed!')
  } catch (err) {
    console.error('Error when connecting to the database!')
  }
})

//unimportant, helps me calculate DATE
