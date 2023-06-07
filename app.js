const express = require('express')
const app = express()
// const ejs = require('ejs');
const bodyParser = require('body-parser');
// 在代码中使用 _.capitalize()
const _ = require('lodash');


const ejs = require('ejs');
let ListName = ['1111', '222']

app.set('views', './views');
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
const mongoose = require('mongoose');


// mongoose.connect('mongodb://127.0.0.1/todolistDB');
mongoose.connect('mongodb+srv://linqian7777:test111@cluster0.njqxyuw.mongodb.net/todolistDB');
// console.log('connections')


const itemsSchema = new mongoose.Schema({
  name: String,

});
const Items = mongoose.model('Items', itemsSchema);
const item1 = new Items({ name: 'Apple' })
const item2 = new Items({ name: 'Orange' })
const item3 = new Items({ name: 'Pineapple' })
const ListItems = [item1, item2, item3]
const itemListSchema = new mongoose.Schema({
  name: String,
  lists: [itemsSchema]

});
const ItemList = mongoose.model('ItemList', itemListSchema);

app.get('/', (req, res) => {
  Items.find({}).then(function (foundItems) {
    // 处理结果
    if (foundItems.length === 0) {
      Items.insertMany(ListItems).then(function (result) {
        // 处理结果
        // console.log(result)
      }).catch(function (err) {
        // 处理错误
      });;
      res.redirect('/')
    } else {
      res.render('index', { day: 'Today', items: foundItems })
    }
    // console.log(foundItems)

  }).catch(function (err) {
    // 处理错误
  });;


})
app.get('/:customListName', (req, res) => {
  console.log(req.params.customListName)
  const customListName = _.capitalize(req.params.customListName)
  ItemList.findOne({ name: customListName }).then(function (foundLists) {
    // 处理结果
    if (!foundLists) {
      // console.log('no data')
      const list = new ItemList({
        name: customListName,
        lists: ListItems
      })
      list.save()
      res.redirect('/' + customListName)
    } else {
      // console.log('data')
      // console.log(foundLists)
      res.render('index', { day: foundLists.name, items: foundLists.lists })
    }

  }).catch(function (err) {
    // 处理错误
    console.log('err')
  });;


})
app.post('/', (req, res) => {
  // ListName.push(req.body.ListName)
  // console.log(ListName)
  // res.render('index', { items: ListName })
  const addItem = req.body.ListName
  const customName = req.body.list
  console.log(customName)
  const item = new Items({ name: addItem })

  if (customName === 'Today') {

    item.save()
    res.redirect('/')
  } else {
    ItemList.findOne({ name: customName }).then(function (foundLists) {
      // 处理结果
      foundLists.lists.push(item)
      foundLists.save()
      res.redirect('/' + customName)

    }).catch(function (err) {
      // 处理错误
      console.log('err')
    });
  }


})
app.post('/delete', (req, res) => {


  const itemId = req.body.checkbox
  const titleName = req.body.title
  console.log(titleName)
  if (titleName === 'Today') {
    Items.deleteOne({ _id: itemId })
      .then(() => {
        console.log("Successfully Deleted");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect('/')
  } else {
    ItemList.updateOne({ name: titleName }, { $pull: { lists: { _id: itemId } } },).then(() => {
      console.log("Successfully Deleted");
      res.redirect('/' + titleName)
    })
      .catch((err) => {
        console.log(err);
      });;
  }


})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 7000;
}
app.listen(port, () => {
  console.log('Serve is running susscessful')
})