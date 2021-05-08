const Task = require('./src/models/task');
require('./src/db/mongoose');
/* 
Task.findByIdAndRemove('6082e0ddd08853290ac48cff').then((task) => {
    console.log(task)
    return Task.countDocuments({ completed: "false" })
}).then((result) => {
    console.log(result)
})
 */

const removeTaskById = async (id) => {
    const userToBeDeleted = await Task.findByIdAndRemove(id)
    const countUsersAfterDeletion = await Task.countDocuments({ completed: "false" })
    console.log(userToBeDeleted)
    return countUsersAfterDeletion
}


removeTaskById('60857b0ada67b857ad2ac7f2').then((count) => {
    console.log(count)
}).catch((err) => {
    console.log(err)
});