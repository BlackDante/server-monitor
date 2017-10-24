const fs = require('fs')
const path = require('path')
const node_ssh = require('node-ssh')
const argv = require('minimist')(process.argv.slice(2))

ssh = new node_ssh()

const commands = new Map();

commands.set('df', {
    options: ['-h'],
    label: 'SPACE'
})

commands.set('mpstat', {
    options: [],
    label: 'CPU'
})

commands.set('free', {
    options: ['-m', '-t'],
    label: 'RAM'
})

function writeStats() {
    console.log('\033c');

    commands.forEach((value, key) => {
        ssh.exec(key, value.options, {
            onStdout(chunk) {
                console.log(`-------------${value.label}-------------`)
                console.log(chunk.toString('utf8'))
            },
            onStderr(chunk) {
                console.log(chunk.toString('utf8'))
            }
        })
    })
}

let interval = argv.i || argv.interval || 5000;
let sshCredentials = {}

if (argv.host) sshCredentials = Object.assign(sshCredentials, {
    host: argv.host
})
if (argv.username) sshCredentials = Object.assign(sshCredentials, {
    username: argv.username
})
if (argv.password) sshCredentials = Object.assign(sshCredentials, {
    password: argv.password
})
if (argv.privateKey) sshCredentials = Object.assign(sshCredentials, {
    privateKey: argv.privateKey
})

ssh.connect(sshCredentials).then(() => {
    writeStats();
    setInterval(writeStats, interval)
})