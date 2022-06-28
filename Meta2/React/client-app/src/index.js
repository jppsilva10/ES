import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const testList = [
            {price: '1.2', name: 'Bolo de bolacha', id: '0'},
            {price: '1.2', name: 'Bolo de chocolate', id: '1'}
]


function FoodItem(props) {
  var x = ""
  if (props.value.count !== undefined) {
    x = " x "
  }
  
  return (
    <option onClick={props.onClick}>
      {props.value.name}{x}{props.value.count}
    </option>
  );
}
//

class List extends React.Component {

  renderFoodItem(i) {
    return (
      <FoodItem 
        key={i}
        value={this.props.items[i]}
        onClick={() => this.props.addItem(i)}
      />
    );
  }

  render() {
    console.log("list");
    var rows = [];
    console.log(this.props.items);
    for (let i = 0; i < this.props.items.length; i++) {
      rows.push(this.renderFoodItem(i));
    }

    return (
      <select name="List" size="5">
        {
          rows
        }
      </select>
    )
  }
}
//

class Order extends React.Component {
  renderFoodItem(i) {
    return (
      <FoodItem
        key={i}
        value={this.props.items[i]}
        onClick={() => this.props.removeItem(i)}
      />
    );
  }

  render() {
    var rows = [];
    for (let i = 0; i < this.props.items.length; i++) {
      rows.push(this.renderFoodItem(i));
    }

    return (
      <select name="Order" size="5">
        {
          rows
        }
      </select>
    )
  }

}

//
class OrderPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      order:[],
      tag: '',
      price: 0,
      image: null,
      page: 'menu'
    };

    this.changeTag = this.changeTag.bind(this);
    this.changeImage = this.changeImage.bind(this);
    this.computePrice = this.computePrice.bind(this);
    this.submitOrder = this.submitOrder.bind(this);

    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/')
        .then((response) => {

          return response.json();

        }).then((data) => {

          console.log(data);
          this.setState({
            list: data.items
          });
    });


  }

  addItem(i) {
    console.log(1212);
    var order = this.state.order.slice(0);
    console.log(order);

    var index = this.state.order.findIndex(item => item.name == this.state.list[i].name);
    console.log(index);

    var item;
    if(index ==-1) {
      item = Object.assign({},this.state.list[i]);
      item.count = 1;
    }
    else {
      item = Object.assign({},this.state.order[index]);
      item.count += 1;
    }

    console.log(item)
    if(index ==-1){
      order = order.concat([item]);

    }
    else{
      order[index] = item;
    }
    console.log(order)

    this.setState({
      order: order
    });
  }

  removeItem(i) {
    var item = Object.assign({},this.state.order[i]);
    item.count -=1;
    var order = this.state.order.slice(0);
    order[i] = item;

    order = order.filter(item => item.count !== 0);
    

    this.setState({
      order: order
    });
  }

  changeTag(event){
    this.setState({tag: event.target.value});
  }

  changeImage(event) {
    console.log(event);
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.state = this.state;
    reader.onloadend = function (e) {
      this.state.image = reader.result.split('base64,')[1];
      console.log(this.state.image);
    }
  }

  validateOrder(){
    if(this.state.order.length==0 || this.state.tag==""){
      return(
          <input type="submit" value="Submit" disabled/>
      );
    }
    else{
      return(
          <input type="submit" value="Submit" />
      );
    }
  }

  computePrice(event) {
    let data = {
      items: this.state.order
    }

    let fetchData = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8'
      })
    }
    console.log(fetchData.body);

    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/compute_order_price/', fetchData)
        .then((response) => {

          return response.json();

        }).then((data) => {
          this.setState({price: data.price, page: 'payment'})
          console.log(data);
    });
    event.preventDefault();
  }

  renderMenu(){
    return(
        <div>
          <div>
            <p> Pratos: </p>
            <List
                items ={this.state.list}
                addItem={(i) => this.addItem(i)}
            />
          </div>
          <div>
            <p> Pedido: </p>
            <Order
                items ={this.state.order}
                removeItem={(i) => this.removeItem(i)}
            />
          </div>
          <form onSubmit={this.computePrice}>
            <lable>
              <input required type="hidden" value={this.state.orderValue}/>
            </lable>
            <label>
              <p>Tag de localização:</p>
              <input required type="text" value={this.state.tag} onChange={this.changeTag} />
            </label>
            <p/>
            {this.validateOrder()}
          </form>
        </div>

    );
  }

  updateImage(image){
    this.setState({image: image});
  }

  changeImage(event) {
    console.log(event);
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.updateImage =  this.updateImage.bind(this);
    reader.onloadend = function (e) {
      reader.updateImage(reader.result.split('base64,')[1]);
    }
    reader.readAsDataURL(file);
  }

  submitOrder(event) {
    let data = {
      tag: this.state.tag,
      items: this.state.order,
      image: this.state.image
    }

    for(let i=0; i<data.items.length; i++){
      data.items[i].count = "" + data.items[i].count;
    }

    let fetchData = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8'
      })
    }
    console.log(fetchData.body);

    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/submit_order/', fetchData)
        .then((response) => {

          return response.json();

        }).then((data) => {

          console.log(data);
          if(data.response!="error"){
            root.render(<DeliveryPage />);
          }
          else {
            root.render(<ErrorPage />);
          }

    });
    event.preventDefault();
  }

  validateImage(){
    if(this.state.image==null){
      return(
          <input type="submit" value="Pagar" disabled/>
      );
    }
    else{
      return(
          <input type="submit" value="Pagar" />
      );
    }
  }

  renderPaymentPage() {
    return (
        <div>
          <p>Preço:</p>
          <p>{this.state.price}€</p>
          <form onSubmit={this.submitOrder}>
            <input type="file" accept=".jpg, .jpeg, .png" onChange={this.changeImage}/>
            <p/>
            {this.validateImage()}
          </form>
        </div>
    );
  }

  render() {
    if(this.state.page=='menu'){
      console.log("menu");
      return(this.renderMenu());
    }
    else if(this.state.page=='payment') {
      return(this.renderPaymentPage());
    }
  }
}
//

class DeliveryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };

    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/get_activity/')
        .then((response) => {

          return response.json();

        }).then((data) => {
          console.log(data);
          this.setState({data: data});
    });

    this.submit = this.submit.bind(this);
  }

  submit(event){
    let data = this.state.data;

    let fetchData = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8'
      })
    }
    console.log(fetchData.body);

    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/confirm_delivery/', fetchData)
        .then((response) => {

          return response.json();

        }).then((data) => {

        console.log(data);
        root.render(<OrderPage />);

    });
    event.preventDefault();
  }

  ValidateDelivery(){
    if(this.state.data!=null){
      return(<input type="submit" value="Confirmar entrega"/>);
    }
    else{
      return(<input type="submit" value="Confirmar entrega" disabled/>);
    }
  }

  render() {
    return (
        <div>
          <form onSubmit={this.submit}>
            {this.ValidateDelivery()}
          </form>
        </div>
    );
  }
}

class ErrorPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div>
          <p>Cliente não encontrado</p>
          <p>Contacte o suporte ao cliente</p>
        </div>
    );
  }
}

// ========================================



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<OrderPage />);