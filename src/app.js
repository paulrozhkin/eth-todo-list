App = {
    loading: false,
    contracts: {},

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },
    
    loadWeb3: async () => {
        if (typeof window.ethereum !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            console.log('MetaMask is installed!');
        } else {
            throw "MetaMask is not installed!"
        }
      },

      loadAccount: async () => {
        // Set the current blockchain account
        App.account = await ethereum.request({ method: 'eth_requestAccounts' });
      },

      loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)
        console.log(App.contracts.TodoList)

        // Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed()
      },

      render: async () => {
        // Prevent double render
        if (App.loading) {
          return
        }
    
        // Update app loading state
        App.setLoading(true)
    
        // Render Account
        $('#account').html(App.account)
    
        // Render Tasks
        await App.renderTasks()
    
        // Update loading state
        App.setLoading(false)
      },
    
      renderTasks: async () => {
        // Load the total task count from the blockchain
        console.log("tesst")
        const taskCount = await App.todoList.taskCount()
        console.log(taskCount)
        const $taskTemplate = $('.taskTemplate')
    
        // Render out each task with a new task template
        for (var i = 1; i <= taskCount; i++) {
          // Fetch the task data from the blockchain
          const task = await App.todoList.tasks(i)
          const taskId = task[0].toNumber()
          const taskContent = task[1]
          const taskCompleted = task[2]
    
          // Create the html for the task
          const $newTaskTemplate = $taskTemplate.clone()
          $newTaskTemplate.find('.content').html(taskContent)
          $newTaskTemplate.find('input')
                          .prop('name', taskId)
                          .prop('checked', taskCompleted)
                          .on('click', App.toggleCompleted)
    
          // Put the task in the correct list
          if (taskCompleted) {
            $('#completedTaskList').append($newTaskTemplate)
          } else {
            $('#taskList').append($newTaskTemplate)
          }
    
          // Show the task
          $newTaskTemplate.show()
        }
      },

      setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
      }
}

$(() => {
  $(window).load(() => {
      App.load()
  })     
})