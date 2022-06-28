import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


function FoodItem(props) {
  var item = ""
  if (props.value.user !== undefined){
    console.log(props.value);
    item += "user: " + props.value.user.S + " - id: " + props.value.id.S + " - status: " + props.value.status.S;
  }
  else{
    item += props.value.M.name.S + " x " + props.value.M.count.N;
  }
  
  return (
    <option onClick={props.onClick}>
      {item}
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
        onClick={() => this.props.showItem(i)}
      />
    );
  }

  render() {
    var rows = [];
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

var state = {
  list:[],
  order:[]
};
//
class OrderPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list:[],
      order:[],
      details: null
    };
    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/staff/list_orders')
        .then((response) => {

          return response.json();

        }).then((data) => {

          console.log(data);
          this.setState({
            list: data.Items
          });
        });
  }

  showItem(i) {
    console.log(this.state.list[i].items.L);
    this.setState({
      details: this.state.list[i],
      order: this.state.list[i].items.L
    });
  }

  renderDetails(){
    if(this.state.details!=null){
      return(
          <div>
          <p><b>cliente:</b> {this.state.details.user.S}</p>
          <p><b>tag:</b> {this.state.details.tag.S}</p>
          <p><b>Estado:</b> {this.state.details.status.S}</p>
          </div>

      )
    }
    else{
      return(<p/>)
    }
  }
  renderItems(){
    if(this.state.order.length!=0){
      return(
          <div>
            <p><b>items:</b></p>
          <Order
              items ={this.state.order}
          />
          </div>
      )
    }
    else{
      return(<p/>)
    }
  }

  completeOrder(event){
    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/staff/complete_order/')
        .then((response) => {

          return response.json();

        }).then((data) => {
          console.log(data);
          root.render(<OrderPage />);

    });
    event.preventDefault();
  }

  render() {

    return(
      <div>
        <div>
          <p> Pedido: </p>
          <List
              items ={this.state.list}
              showItem={(i) => this.showItem(i)}
          />
        </div>
        <div>
          <p> Details: </p>
          {this.renderDetails()}
          {this.renderItems()}
        </div>
        <form onSubmit={this.completeOrder}>
          <input type="submit" value="Terminar" />
        </form>
      </div>

    )
  }
}

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      token: getCookie("token"),
      logged: false,
      message: ''
    };

    let data = {
      auth_token: this.state.token
    }

    console.log(data);

    let fetchData = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8'
      })
    }

    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/staff/authenticate/', fetchData)
        .then((response) => {

          return response.json();

        }).then((data) => {

      console.log(data);
      this.setState({
        logged: data.body.value
      });

    });

    this.changeUsername = this.changeUsername.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.submit = this.submit.bind(this);
  }

  changeUsername(event) {
    this.setState({username: event.target.value});
  }

  changePassword(event) {
    this.setState({password: event.target.value});
  }

  submit(event) {
    let data = {
      username: this.state.username,
      password: this.state.password
    }

    console.log(data);

    let fetchData = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8'
      })
    }
    console.log(fetchData.body);

    fetch('http://teste-env-2.us-east-1.elasticbeanstalk.com/meal_info/staff/login/', fetchData)
        .then((response) => {

          return response.json();

        }).then((data) => {

          console.log(data);
          var message = ''
          if(!data.body.logged){
            message = 'username ou password errados';
          }
          else{
            console.log(data.body.token);
            setCookie("token", data.body.token, 1);
          }
          this.setState({
            token: data.body.token,
            logged: data.body.logged,
            message: message
          });



    });
    event.preventDefault();
  }

  render() {
    if(this.state.logged){
      root.render(<OrderPage />);
    }
    return (
        <div>
        <form onSubmit={this.submit}>
          <label>
            Username:
            <input required type="text" value={this.state.username} onChange={this.changeUsername} />
          </label>
          <label>
            Password:
            <input required type="password" value={this.state.password} onChange={this.changePassword} />
          </label>
          <input type="submit" value="Submeter" />
        </form>
        <p>{this.state.message}</p>
        </div>
    );
  }
}

// ========================================



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<LoginPage />);

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
