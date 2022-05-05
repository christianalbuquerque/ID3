var id3 = function (base, alvo, propriedades) { // Base é nossa base de dados. Alvo é a propriedade verificada. Propriedades são as analisadas do base
  var alvos = _.unique(base.pluck(alvo));
  console.log(alvos.length); //Quantidade de Valores vindos do alvo
  if (alvos.length == 1) {
    console.log("Fim do Nó! " + alvos[0]);
    return {
      type: "result",
      val: alvos[0],
      name: alvos[0],
      alias: alvos[0]
    };
  }
  if (propriedades.length == 0) {
    console.log("Retornando propriedade mais dominante!!!");
    var alvoDom = maisComum(base.pluck(alvo));
    return {
      type: "result",
      val: alvoDom,
      name: alvoDom,
      alias: alvoDom
    };
  }
  var melhorPropriedade = ganhoMaximo(base, alvo, propriedades);
  var propriedadesRestantes = _.without(propriedades, melhorPropriedade);
  var valoresPossiveis = _.unique(base.pluck(melhorPropriedade));
  console.log("Nó: " + melhorPropriedade);
  var node = { name: melhorPropriedade, alias: melhorPropriedade };
  node.type = "feature";
  node.vals = _.map(valoresPossiveis, function (v) {
    console.log("Criando ramificação para: " + v);
    var novaBase = _(
      base.filter(function (x) {
        return x[melhorPropriedade] == v;
      })
    );
    var no_filho = { name: v, alias: v, type: "feature_value" };
    no_filho.child = id3(novaBase, alvo, propriedadesRestantes);
    return no_filho;
  });
  return node;
};

var predicao = function (modeloId3, amostra) {
  var raiz = modeloId3;
  while (raiz.type != "result") {
    var attr = raiz.name;
    var amostraVal = amostra[attr];
    var noFihlo = _.detect(raiz.vals, function (x) {
      return x.name == amostraVal;
    });
    raiz = noFihlo.child;
  }
  return raiz.val;
};

//Funções matematicas

var entropia = function (vals) {
  var valoresUnicos = _.unique(vals);
  var probabilidades = valoresUnicos.map(function (x) {
    return probabilidade(x, vals);
  });
  var valorLog = probabilidades.map(function (p) {
    return -p * log2(p);
  });
  return valorLog.reduce(function (a, b) {
    return a + b;
  }, 0);
};

var ganho = function (base, alvo, feature) {
  var valorAtr = _.unique(base.pluck(feature));
  var definirEntropia = entropia(base.pluck(alvo));
  var definirTamanho = base.size();
  var entropias = valorAtr.map(function (n) {
    var subconjunto = base.filter(function (x) {
      return x[feature] === n;
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
  if (node.type == "feature") {
    _.each(node.vals, function (m) {
      g.push([m.alias, node.alias, ""]);
      g = addArestas(m, g);
    });
    return g;
  }
  if (node.type == "feature_value") {
    g.push([node.child.alias, node.alias, ""]);
    if (node.child.type != "result") {
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
