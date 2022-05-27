//hämtar html elements
const accountBox = document.querySelector("#accountbox");
const userInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const totalInput = document.querySelector("#total");
const loginForm = document.querySelector("#loginform");
const loginUser = document.querySelector("#loginname");
const loginPassword = document.querySelector("#loginpass");
const logoutForm = document.querySelector("#logoutform");
const totalForm = document.querySelector("#totalform");
const totalinInput = document.querySelector("#totalin");
const withdrawform = document.querySelector("#withdrawform");
const withdrawInput = document.querySelector("#withdraw");
const deleteForm = document.querySelector("#deleteform");
const registerform = document.querySelector("#registerform");
const totalContainer = document.querySelector("#totaldiv"); //total container/box
const accountText = document.querySelector("#blaText");
//hiding elements
totalContainer.style.display = 'none';
logoutForm.style.display = 'none';
accountText.style.display = 'none';
accountBox.style.display = 'none';

//user login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: loginUser.value,
      password: loginPassword.value
    })
  });

  location.reload();
  console.log("Login funkar"); //radera sen
})

registerform.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: userInput.value,
      password: passwordInput.value,
      total: parseInt(totalInput.value) //parses a string argument and returns an integer 
    })
  });

  const data = res.json();
  alert('Thank you for your registration! You can login now.')
  registerform.reset(); //clear inputs

});


//control login status
const loggedin = async () => {
  const res = await fetch('/api/users/loggedin');
  const data = await res.json();

  console.log("User data: ", data.user);//radera sen

  if (data.user) {
    
    registerform.style.display = 'none'; //hiding regform
    loginForm.style.display = 'none'; //hiding loginform
    totalContainer.style.display = 'block'; //show total form to change amount
    logoutForm.style.display = 'block'; //logout btn visas
    accountText.style.display = 'block'; //text visas
    accountBox.style.display = 'block'; //acount info container

    
    let welcomeText = document.createElement('h4');
    let userName = document.createElement('p');
    let userTotal = document.createElement('p');
    let accountID = document.createElement('p');
    let userAccount = data.user;

    welcomeText.innerText = "Logged in " + userAccount.user;
    userName.innerText = "Name: " + userAccount.user;
    userTotal.innerText = "Total: " + userAccount.total + " $";
    accountID.innerText = "Account ID: " + userAccount._id;
    //console.log("Users total: " + userAccount.total);

    accountBox.append(userName, userTotal, accountID);

  } else {
    console.log('Sign In' + data);
  }

  totalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch(`/api/users/update/${data.user._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({

        user: data.user.user,
        password: data.user.password,
        total: parseInt(data.user.total) + parseInt(totalinInput.value) 
      })
    });

    totalForm.reset();
    location.reload();
  });

  withdrawform.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if(data.user.total >= withdrawInput.value){

      await fetch(`/api/users/update/${data.user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: data.user.user,
          password: data.user.password,
          total: parseInt(data.user.total) - parseInt(withdrawInput.value)
        })
      });

      console.log(data.user.total , withdrawInput.value);

      withdrawform.reset(); //clears values of form elements
      location.reload(); //refreshar

    } else {
      alert("You can't withdraw more money than you have!");
    }
  });

  deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch(`/api/users/delete/${data.user._id}`, {
      method: 'DELETE'
    });

    console.log(data.user.user + "deleted successfully!"); //ta bort sen
    location.reload();
  });

}

logoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  await fetch('/api/users/logout', {
    method: 'POST'
  });

  location.reload();
})

loggedin(); //aktiverar

