const mongoose = require('mongoose');

const StudentsSchema = new mongoose.Schema({
  login: {
    type: String
  },
  lastUpdatedByFGV: {
    type: String
  },
  lastUpdatedByMe: {
    type: String
  },
  schedule: [],
});

const Student = mongoose.model('Students', StudentsSchema);

module.exports = Student;
