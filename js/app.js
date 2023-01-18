App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasCreatedProfile: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7544');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Account.json", function(account) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.account = TruffleContract(account);
      // Connect provider to interact with contract
      App.contracts.account.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.account.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.usersCheck({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new account is created
        App.render();
      });
    });
  },

  render: async() => {
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    //Printing all the profiles in the network..
    var profiles = $("#profiles")
    const prof = await App.account.getUsers
    if(prof){
      for (var i = 0; i < prof.length; i++) {
      const profile = prof[i];
      var profileTemplate = "<div class='col-lg-4 col-md-6 my-lg-0 my-3'><a href='./profileDetails.html' style='color:#333333;' class='goToProfile'><div class='box bg-white'><div class='d-flex align-items-center'><div class='rounded-circle mx-3 text-center d-flex align-items-center justify-content-center green'> <img src='https://freepngimg.com/thumb/symbol/87865-leaf-icons-button-mark-computer-green-check.png' alt=''></div><div class='d-flex flex-column'><b>"+profile.firstName+" "+profile.lastName+"</b><a href=''><p class='text-muted'>Verified</p></a></div></div></div></a></div>"
      profiles.append(profileTemplate);
    }
    }
    
  },

  getProfile: async(address) => {
    var profileDetails = $("#profileDetails")
    var certificates = $("#certificates")
    const profile = await App.account.getUser(address)
    const certifs = await App.account.getUserCertificates(profile.Address)
    var prof = "<div class='title'>"+profile.firstName+" "+profile.lastName+"</div><p><small class='text-muted'>Phone number : +216"+profile.phone+"</br>Email Address : "+profile.email+"</p>"
    profileDetails.append(prof);
    for (var i = 0; i < certifs.length; i++) {
      const certif = certifs[i];
      var certifTemplate = " <div class=``card col-md-3 mt-5`` id=``certificates``><div class=``card-content``><div class=``card-body p-0``><div class=``profile``> <img src=``https://freepngimg.com/thumb/symbol/87865-leaf-icons-button-mark-computer-green-check.png``> </div> <div class=``card-title``>"+certif.name+"<br /><small>Received on the "+certif.date+"</small> </div></div></div></div>"
      profiles.append(certifTemplate);
    }
  },

  addProfile: async() => {
    App.setLoading(true)
    const firstName = $('#exampleInputFirstName').val()
    const lastName = $('#exampleInputLastName').val()
    const phone = $('#exampleInputPhone').val()
    const email = $('#exampleInputEmail').val()
    await App.account.addUser(firstName, lastName, phone, email)
    await App.render()

    location.reload()
  }
  
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$(".goToProfile").click(function (address) {
  App.getProfile();
});
