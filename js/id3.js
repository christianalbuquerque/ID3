var id3 = function (base, alvo, propriedades) { // Base é nossa base de dados. Alvo é a propriedade verificada. Propriedades são as analisadas do base
  var alvos = _.unique(base.pluck(alvo)); //pluck transforma o que vem como CSV em um objeto
  console.log(alvos.length); //Quantidade de Valores vindos do alvo
  if (alvos.length == 1) { // Verifica se o alvo é uma "folha", se for ele é considerado um resultado
    console.log("Fim do Nó! " + alvos[0]);
    return {
      type: "resultado",
      val: alvos[0],
      name: alvos[0],
      alias: alvos[0]
    };
  }
  if (propriedades.length == 0) { // ESTUDAR MAIS ISSO
    console.log("Retornando propriedade mais dominante!!!");
    var alvoDom = maisComum(base.pluck(alvo));
    return {
      type: "resultado",
      val: alvoDom,
      name: alvoDom,
      alias: alvoDom
    };
  }
  var melhorPropriedade = ganhoMaximo(base, alvo, propriedades); // Verifica qual é o melhor atributo baseado no cálculo do ganho
  var propriedadesRestantes = _.without(propriedades, melhorPropriedade); // Aqui define o restante das propriedades SEM o melhor atributo
  var valoresPossiveis = _.unique(base.pluck(melhorPropriedade)); // Com base no que vem da melhorPropriedade é definido quais são os valores possíveis
  console.log("Nó: " + melhorPropriedade);
  var no = { name: melhorPropriedade, alias: melhorPropriedade }; // Aqui se cria um novo objeto chamado no que vai servir como base para a criação dos próximos passos
  no.type = "propriedade";
  no.vals = _.map(valoresPossiveis, function (v) { // Aqui estamos mapeando (fazendo um laço) com os valores possíveis e adicionando dentro da propriedade do objeto: vals 
    console.log("Criando ramificação para: " + v);
    var novaBase = _( // Aqui estamos criando a nova base com as informações que chegaram
      base.filter(function (x) {
        return x[melhorPropriedade] == v;
      })
    );
    var no_filho = { name: v, alias: v, type: "valor_propriedade" }; // Criando o filho que vai ser gerado na árvore
    no_filho.child = id3(novaBase, alvo, propriedadesRestantes);
    return no_filho;
  });
  return no;
};

var predicao = function (modeloId3, amostra) { // Função de predição
  var raiz = modeloId3;
  while (raiz.type != "resultado") {
    var atributo = raiz.name;
    var amostraVal = amostra[atributo];
    var noFilho = _.detect(raiz.vals, function (x) {
      return x.name == amostraVal;
    });
    raiz = noFilho.child;
  }
  return raiz.val;
};

//Funções matematicas

var entropia = function (vals) { // Cálculo de entropia
  var valoresUnicos = _.unique(vals); // Aqui se lista os válores únicos para ser feito a entropia
  var probabilidades = valoresUnicos.map(function (x) { // Retorna as probabilidades calculadas dos valores únicos
    return probabilidade(x, vals);
  });
  var valorLog = probabilidades.map(function (p) { // Aqui se calcula o log do valor
    return -p * log2(p);
  });
  return valorLog.reduce(function (a, b) { // Aqui se faz a soma para resultar o valor da entropia
    return a + b;
  }, 0);
};

var ganho = function (base, alvo, propriedade) { // Calcula o ganho da propriedade
  var valorAtr = _.unique(base.pluck(propriedade));
  var definirEntropia = entropia(base.pluck(alvo));
  var definirTamanho = base.size();
  var entropias = valorAtr.map(function (n) {
    var subconjunto = base.filter(function (x) {
      return x[propriedade] === n;
    });
    return (subconjunto.length / definirTamanho) * entropia(_.pluck(subconjunto, alvo));
  });
  var somaDasEntropias = entropias.reduce(function (a, b) {
    return a + b;
  }, 0);
  return definirEntropia - somaDasEntropias;
};

var ganhoMaximo = function (base, alvo, propriedades) {
  return _.max(propriedades, function (e) {
    return ganho(base, alvo, e);
  });
};

var probabilidade = function (val, vals) {
  var istancias = _.filter(vals, function (x) {
    return x === val;
  }).length;
  var total = vals.length;
  return istancias / total;
};

var log2 = function (n) {
  return Math.log(n) / Math.log(2);
};

var maisComum = function (l) {
  return _.sortBy(l, function (a) {
    return contador(a, l);
  }).reverse()[0];
};

var contador = function (a, l) {
  return _.filter(l, function (b) {
    return b === a;
  }).length;
};


//Parte Gráfica

var desenharGrafico = function (modeloId3, divId) {
  var g = new Array();
  g = addArestas(modeloId3, g).reverse();
  window.g = g;
  var data = google.visualization.arrayToDataTable(g.concat(g));
  var chart = new google.visualization.OrgChart(document.getElementById(divId));
  google.visualization.events.addListener(chart, "ready", function () {
    _.each($(".google-visualization-orgchart-node"), function (x) {
      var oldVal = $(x).html();
      if (oldVal) {
        var cleanVal = oldVal.replace(/_r[0-9]+/, "");
        $(x).html(cleanVal);
      }
    });
  });
  chart.draw(data, { allowHtml: true });
};

var addArestas = function (node, g) {
  if (node.type == "propriedade") {
    _.each(node.vals, function (m) {
      g.push([m.alias, node.alias, ""]);
      g = addArestas(m, g);
    });
    return g;
  }
  if (node.type == "valor_propriedade") {
    g.push([node.child.alias, node.alias, ""]);
    if (node.child.type != "resultado") {
      g = addArestas(node.child, g);
    }
    return g;
  }
  return g;
};

var renderizarAmostras = function (amostras, $el, modelo, alvo, propriedades) {
  _.each(amostras, function (s) {
    var propriedades_base_exemplo = _.map(propriedades, function (x) {
      return s[x];
    });
    $el.append(
      "<tr><td>" +
      propriedades_base_exemplo.join("</td><td>") +
        "</td><td><b>" +
        predicao(modelo, s) +
        "</b></td><td>Atual: " +
        s[alvo] +
        "</td></tr>"
    );
  });
};
