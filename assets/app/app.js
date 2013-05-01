
var app = angular.module('LaserTag', []);

app.factory('phonegapReady', function ($rootScope) {

    $rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };


    return function (fn) {
      var queue = [];

      var impl = function () {
        queue.push(Array.prototype.slice.call(arguments));
      };

      document.addEventListener('deviceready', function () {
        queue.forEach(function (args) {
          fn.apply(this, args);
        });
        impl = fn;
      }, false);
      return function () {
        return impl.apply(this, arguments);
      };
    };
  });




app.factory('bluetooth', function ($rootScope, phonegapReady) {

  var bluetoothPlugin = cordova.require('cordova/plugin/bluetooth');
  return {
    disable: phonegapReady(function (onSuccess, onError) {
      bluetoothPlugin.disable(function () {
        var that = this,
          args = arguments;

        if (onSuccess) {
          $rootScope.safeApply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this,
          args = arguments;

        if (onError) {
          $rootScope.safeApply(function () {
            onError.apply(that, args);
          });
        }
      });
    }),
    enable: phonegapReady(function (onSuccess, onError) {
      bluetoothPlugin.enable(function () {
        var that = this,
          args = arguments;

        if (onSuccess) {
          $rootScope.safeApply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this,
          args = arguments;

        if (onError) {
          $rootScope.safeApply(function () {
            onError.apply(that, args);
          });
        }
      });
    }),
    getBondedDevices: phonegapReady(function (onSuccess, onError) {
      bluetoothPlugin.getBondedDevices(function () {
        var that = this,
          args = arguments;

        if (onSuccess) {
          $rootScope.safeApply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this,
          args = arguments;

        if (onError) {
          $rootScope.safeApply(function () {
            onError.apply(that, args);
          });
        }
      });
    }),
    fetchUUIDs: phonegapReady(function (onSuccess, onError, address) {
      bluetoothPlugin.fetchUUIDs(function () {
        var that = this,
          args = arguments;

        if (onSuccess) {
          $rootScope.safeApply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this,
          args = arguments;

        if (onError) {
          $rootScope.safeApply(function () {
            onError.apply(that, args);
          });
        }
      }, address);
    }),
    connect: phonegapReady(function (onSuccess, onError, address, uuid) {
      bluetoothPlugin.connect(function () {
        var that = this,
          args = arguments;

        if (onSuccess) {
          $rootScope.safeApply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this,
          args = arguments;

        if (onError) {
          $rootScope.safeApply(function () {
            onError.apply(that, args);
          });
        }
      }, address, uuid, true);
    }),
    read: phonegapReady(function (onSuccess, onError, socket) {
      bluetoothPlugin.read(function () {
        var that = this,
          args = arguments;

        if (onSuccess) {
          $rootScope.safeApply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this,
          args = arguments;

        if (onError) {
          $rootScope.safeApply(function () {
            onError.apply(that, args);
          });
        }
      }, socket);
    }),
    write: phonegapReady(function (onSuccess, onError, socket, message) {
      bluetoothPlugin.write(function () {
        var that = this,
          args = arguments;

        if (onSuccess) {
          $rootScope.safeApply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this,
          args = arguments;

        if (onError) {
          $rootScope.safeApply(function () {
            onError.apply(that, args);
          });
        }
      }, socket, message);
    })
  };
});


app.controller('LaserTag', function ($scope, bluetooth) {
    var socket = -1;
    var uuid = '';
    var address = '';
    $scope.devices = [{name: 'No devices', address: ''}];

    $scope.gameState = 'Not connected';

    $scope.game = {};

    //Default game values
    $scope.game.type = 'A';
    $scope.game.typeText = 'Deathmatch';
    $scope.game.limit = 15;
    $scope.game.playerNumber = 96;

    $scope.game.enemyList = [];

    //Default EnemyNumber
    $scope.game.selectedEnemyNumber = 32;

    //Hits received
    $scope.hits = [];

    //Default shots fired
    $scope.shotsFired = 0;

    //Limit name and type
    $scope.limitName = 'kills';
    $scope.limitType = 'Kill';

  //Bluetooth Control Function

    //Turns bluetooth off
    $scope.bluetoothOff = function () {
        bluetooth.disable(function () {
            alert('OFF!');
        }, function (error) {
            alert('Error going on: ' + error);
        });
    };

    //Turns bluetooth on
    $scope.bluetoothOn = function () {
        bluetooth.enable(function () {
            alert('ON!');
        }, function (error) {
            alert('Error going on: ' + error);
        });
    };

    //Gets list of paired devices
    $scope.bluetoothGetDevices = function () {
        bluetooth.getBondedDevices(function (devices) {
            if (devices.length === 0) {
              $scope.devices = [{name: 'No devices', address: ''}];
            } else {
              $scope.devices = devices;
            }
        }, function (error) {
            alert('Error: ' + error);
        });
    };

    //Connects to the selected device
    $scope.bluetoothConnect = function (addr) {
      if (addr) {
        address = addr;
        bluetooth.fetchUUIDs(function (UUIDs) {
          //alert('UUIDs: ' + UUIDs[0]);
          uuid = UUIDs[0];
          bluetooth.connect(function (sock) {
            //alert('Connected!  Socket is: ' + socket + ', Sock is: ' + sock);
            socket = sock;

            //Sets up the reader.
            ReadHandler(bluetooth, socket);

            //After connecting it moves on to the configuration page
            WriteConnect(bluetooth, socket);
          }, function (error) {
            alert('Error connecting: ' + error);
          }, address, uuid);
        }, function (error) {
          alert('Error fetching UUIDs: ' + error);
        }, address);
      } else {
        alert('That is not a valid device!');
      }
    };

  //Functions for handling information

    //Function that creates the reading thread.
    function ReadHandler (bluetoothObject, socketNumber) {
      bluetoothObject.read(function (response) {
        MessageHandler(response);
      }, function (error) {
        alert('Error setting up read: ' + error);
      }, socketNumber);
    }

    //Function that handles the messages as they arrive.
    function MessageHandler (received_item) {
      switch (received_item.type) {
        case 'response':
          handleResponse(received_item);
          break;
        case 'hit':
          handleHit(received_item);
          break;
        case 'player':
          handlePlayer(received_item);
          break;
        default:
          alert('Received an item that is not response, hit, or player.');
      }
    }

    //Function that handles message responses
    function handleResponse (message) {
      switch(message.response) {
        case 'connected':
              handleConnected(message);
              break;
        case 'new':
              handleNew(message);
              break;
        case 'information':
              handleInformation(message);
              break;
        case 'start':
              handleStart(message);
              break;
        case 'end':
              handleEnd(message);
              break;
        case 'hitAcknowledged':
              handleHitAcknowledge(message);
              break;
        default:
          alert('It received a response that is not in the list.');
      }
    }

    //When the response is 'connected'
    function handleConnected (message) {
      $scope.gameState = 'Connected';
      $.mobile.changePage('#newGame');
    }

    //When the response is 'new'
    function handleNew (message) {
      $scope.gameState = 'Awaiting game info';
      $.mobile.changePage('#setupGame');
    }

    //When the response is 'information'
    function handleInformation (message) {
      $scope.gameState = 'Game ready to start';
      $.mobile.changePage('#startScreen');
    }

    //When the response is 'start'
    function handleStart (message) {
      $scope.gameState = 'Game running';
      $.mobile.changePage('#runningGame');
    }

    //When the response is 'end'
    function handleEnd (message) {
      $scope.gameState = 'Game ended';
      $.mobile.changePage('#endGame');
    }

    //When the response is 'hitAcknowledge'
    function handleHitAcknowledge (message) {
      //$scope.acknowledgedShots.push(message.hitNumber);
      console.log('Hit acknowledged: ' + message.hitNumber);
    }

    //When the message is hit information
    function handleHit (message) {
      $scope.hits.push({enemy: message.id, hitNumber: message.hitNumber, location: message.gps});
      WriteAcknowledge(bluetooth, socket, message.hitNumber);
    }

    //When the message is player information
    function handlePlayer (message) {
      $scope.shotsFired = message.shotsFired;
    }

  //Game Flow Functions

    //Starts a new game
    $scope.gameNew = function () {
      WriteNew(bluetooth, socket);
    };

    //Sends game information 
    $scope.gameInformation = function () {
      WriteInformation(bluetooth, socket, $scope.game.playerNumber, $scope.game.type, $scope.game.limit, $scope.game.enemyList);
    };

    //Starts a game
    $scope.gameStart = function () {
        WriteStart(bluetooth, socket);
    };

    //Ends the game
    $scope.gameEnd = function () {
      WriteEnd(bluetooth, socket);
    };

    //Resets the variables and starts a new game
    $scope.gameReset = function () {
      //Starts a new game
      $scope.gameNew();

      //Sets game as an empty object
      $scope.game = {};

      //Default game values
      $scope.game.type = 'A';
      $scope.game.limit = 15;
      $scope.game.playerNumber = 96;
      $scope.game.enemyList = [];

      //Limit name and type
      $scope.limitName = 'kills';
      $scope.limitType = 'Kill';
      $scope.game.typeText = 'Deathmatch';

      //Default selected enemy number
      $scope.game.selectedEnemyNumber = 32;

      //Resets hits received to none
      $scope.hits = [];

      //Resets shots fired to zero
      $scope.shotsFired = 0;


    };


  //Write Functions

    //Writes CONNECT message
    function WriteConnect (bluetoothObject, socketNumber) {
      var message = [];
      var messageString = '#C,# ';
      for(var i = 0 ; i < messageString.length ; i++){
        message[i] = messageString.charCodeAt(i);
      }

      bluetoothObject.write(function () {
        console.log('WriteConnect was a success.');
      }, function (error) {
        alert('Error writing connect: ' + error);
      }, socketNumber, message);
    }

    //Writes NEW GAME message
    function WriteNew (bluetoothObject, socketNumber) {
      var message = [];
      var messageString = '#N,# ';
      for(var i = 0 ; i < messageString.length ; i++){
        message[i] = messageString.charCodeAt(i);
      }

      bluetoothObject.write(function () {
        console.log('WriteNew was a success.');
      }, function (error) {
        alert('Error writing connect: ' + error);
      }, socketNumber, message);
    }

    //Writes GAME INFORMATION message
    function WriteInformation (bluetoothObject, socketNumber, playerNumber, gameType, gameLimit, enemyList) {
      var message = [];

      var enemyString = ''+enemyList.length+',';
      for(var i = 0 ; i < enemyList.length ; i++){
        enemyString = enemyString + '' + enemyList[i] + ',';
      }

      var messageString = '#I,'+gameType+','+playerNumber+','+gameLimit+','+enemyString+'# ';
      //alert('Message to send: ' + messageString);

      for (var j = 0 ; j < messageString.length; j++) {
        message[j] = messageString.charCodeAt(j);
      }

      bluetoothObject.write(function () {
        console.log('Information write was a success');
      }, function (error) {
        alert('Error writing game information: ' + error);
      }, socketNumber, message);
    }

    //Writes NEW GAME message
    function WriteStart (bluetoothObject, socketNumber) {
      var message = [];
      var messageString = '#S,# ';
      for(var i = 0 ; i < messageString.length ; i++){
        message[i] = messageString.charCodeAt(i);
      }

      bluetoothObject.write(function () {
        console.log('Game start write was a success');
      }, function (error) {
        alert('Error writing connect: ' + error);
      }, socketNumber, message);
    }

    //Writes DATA ACKNOWLEDGE message
    function WriteAcknowledge (bluetoothObject, socketNumber, hitNumber) {
      var message = [];
      var messageString = '#A,'+hitNumber+',# ';
      for(var i = 0 ; i < messageString.length ; i++){
        message[i] = messageString.charCodeAt(i);
      }

      bluetoothObject.write(function () {
        console.log('Data acknowledge write was a success');
      }, function (error) {
        alert('Error writing connect: ' + error);
      }, socketNumber, message);
    }

    //Writes DATA ACKNOWLEDGE message
    function WriteEnd (bluetoothObject, socketNumber) {
      var message = [];
      var messageString = '#O,0,# ';
      for(var i = 0 ; i < messageString.length ; i++){
        message[i] = messageString.charCodeAt(i);
      }

      bluetoothObject.write(function () {
        console.log('Game over write was a success');
      }, function (error) {
        alert('Error writing connect: ' + error);
      }, socketNumber, message);
    }

  //Game info related functions

    //Adds an enemy to the array
    $scope.addEnemy = function(enemyNumber) {
      $scope.game.enemyList.push(enemyNumber);
      $scope.game.selectedEnemyNumber++;
      console.log('Enemy number added: ' + enemyNumber);
    };

  //When game.type changes
    //Sets the value of 
    $scope.updateTypeText = function (gameType) {
      //$scope.game.type = 'A';
      //$scope.game.typeText = 'Deathmatch';
      //Limit name
      //$scope.limitName = 'kills';
      if($scope.game.type==='A'){
        $scope.game.typeText = 'Deathmatch';
        $scope.limitName = 'kills';
        $scope.limitType = 'Kill';
      } else {
        $scope.game.typeText = 'Timed Deathmatch';
        $scope.limitName = 'minutes';
        $scope.limitType = 'Time';
      }

    };

});


