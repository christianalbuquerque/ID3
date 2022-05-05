//This file contains example training data and samples


//some sample data we'll be using
//http://www.cise.ufl.edu/~ddd/cap6635/Fall-97/Short-papers/2.htm
var base = [
    {dia:'D1',clima:'Ensolarado', temp:'Quente', humidade:'Alta', vento: 'Fraco',jogo:'Não'},
    {dia:'D2',clima:'Ensolarado', temp:'Quente', humidade:'Alta', vento: 'Forte',jogo:'Não'},
    {dia:'D3',clima:'Nublado', temp:'Quente', humidade:'Alta', vento: 'Fraco',jogo:'Sim'},
    {dia:'D4',clima:'Chuvoso', temp:'Ameno', humidade:'Alta', vento: 'Fraco',jogo:'Sim'},
    {dia:'D5',clima:'Chuvoso', temp:'Frio', humidade:'Normal', vento: 'Fraco',jogo:'Sim'},
    {dia:'D6',clima:'Chuvoso', temp:'Frio', humidade:'Normal', vento: 'Forte',jogo:'Não'},
    {dia:'D7',clima:'Nublado', temp:'Frio', humidade:'Normal', vento: 'Forte',jogo:'Sim'},
    {dia:'D8',clima:'Ensolarado', temp:'Ameno', humidade:'Alta', vento: 'Fraco',jogo:'Não'},
    {dia:'D9',clima:'Ensolarado', temp:'Frio', humidade:'Normal', vento: 'Fraco',jogo:'Sim'},
    {dia:'D10',clima:'Chuvoso', temp:'Ameno', humidade:'Normal', vento: 'Fraco',jogo:'Sim'},
    {dia:'D11',clima:'Ensolarado', temp:'Ameno', humidade:'Normal', vento: 'Forte',jogo:'Sim'},
    {dia:'D12',clima:'Nublado', temp:'Ameno', humidade:'Alta', vento: 'Forte',jogo:'Sim'},
    {dia:'D13',clima:'Nublado', temp:'Quente', humidade:'Normal', vento: 'Fraco',jogo:'Sim'},
    {dia:'D14',clima:'Chuvoso', temp:'Ameno', humidade:'Alta', vento: 'Forte',jogo:'Não'}
    ];
    
    base = _(base);
    var propriedades = ['clima', 'temp', 'humidade', 'vento'];
    var amostras = [{clima:'Nublado', temp:'Ameno', humidade:'Alta', vento: 'Forte',jogo: 'Sim'},
               {clima:'Chuvoso', temp:'Ameno', humidade:'Alta', vento: 'Forte', jogo: 'Não'},
               {clima:'Ensolarado', temp:'Frio', humidade:'Normal', vento: 'Fraco', jogo: 'Sim'}]
    
    