import React from 'react';
import Graph from "react-graph-vis";
import PriorityQueue from "js-priority-queue";

var tableauCheminAParcourir;
var positiondanstableau = 0;
var prioQueue = new PriorityQueue({ comparator: function (a, b) { return a.value - b.value; } });
var tableauNodesCopie = [];
/*
    Auteur : Bastien Boulanger
    DA : 1838295
    Nom : AffichageGraph
    Description : S'occupe de l'affichage du graphique. Avec l'implementation de l'algorytme de dijkstra, la classe affiche aussi le chemin le plus optimal
                  pour se rendre du début (la case bleu) à la fin (la case rouge) et change le chemin en case rose a toute les .5 secondes.
*/
class AffichageGraph extends React.Component {
    constructor(props) {
        super(props);
        var tableauNodes = [];
        var tableauEdges = [];
        var cmpty = 0;
        var cmptx = 0;
        var idDepart;
        var idFin;
        for (var i = 0; i < 25; i++) {
            //Indique le debut
            if (i === 0) {
                idDepart = i;
                tableauNodes.push({ id: i, label: "Node " + (i + 1), color: "#6DB1E5", groupe: "Chemin", x: cmptx, y: cmpty, value: 0, visite: false });
            }
            //indique les murs
            else if (i === 1 || i === 6 || i === 8 || i === 13 || i === 16 || i === 18) {
                tableauNodes.push({ id: i, label: "Node " + (i + 1), color: "#859099", groupe: "Mur", x: cmptx, y: cmpty, value: Number.MAX_VALUE, visite: false });
            }
            //indique la fin
            else if (i === 9) {
                idFin = i;
                tableauNodes.push({ id: i, label: "Node " + (i + 1), color: "#D83D3D", groupe: "Chemin", x: cmptx, y: cmpty, value: Number.MAX_VALUE, visite: false });
            }
            //indique les chemins
            else {
                tableauNodes.push({ id: i, label: "Node " + (i + 1), color: "#FFFFFF", groupe: "Chemin", x: cmptx, y: cmpty, value: Number.MAX_VALUE, visite: false });
            }
            //gestion de position pour affichage
            cmptx += 100;
            if (i === 4 || i === 9 || i === 14 || i === 19 || i === 24) {
                cmpty += 100;
                cmptx = 0;
            }
        }
        //Instancie les liens de chaque nodes
        for (var j = 0; j < 25; j++) {
            if (j === 0) {
                tableauEdges.push({ from: 0, to: 5 });
                tableauEdges.push({ from: 0, to: 1 });
            }
            else if (j === 4) {
                tableauEdges.push({ from: 4, to: 3 });
                tableauEdges.push({ from: 4, to: 9 });
            }
            else if (j === 20) {
                tableauEdges.push({ from: 20, to: 15 });
                tableauEdges.push({ from: 20, to: 21 });
            }
            else if (j === 24) {
                tableauEdges.push({ from: 24, to: 23 });
                tableauEdges.push({ from: 24, to: 19 });
            }
            else if (j === 1 || j === 2 || j === 3) {
                tableauEdges.push({ from: j, to: j - 1 });
                tableauEdges.push({ from: j, to: j + 5 });
                tableauEdges.push({ from: j, to: j + 1 });
            }
            else if(j === 21 || j === 22 || j === 23){
                tableauEdges.push({ from: j, to: j - 1 });
                tableauEdges.push({ from: j, to: j - 5 });
                tableauEdges.push({ from: j, to: j + 1 });
            }
            else if (j === 5 || j === 10 || j === 15) {
                tableauEdges.push({ from: j, to: j - 5 });
                tableauEdges.push({ from: j, to: j + 1 });
                tableauEdges.push({ from: j, to: j + 5 });
            }
            else if (j === 9 || j === 14 || j === 19) {
                tableauEdges.push({ from: j, to: j - 5 });
                tableauEdges.push({ from: j, to: j - 1 });
                tableauEdges.push({ from: j, to: j + 5 });
            }
            else {
                tableauEdges.push({ from: j, to: j - 5 });
                tableauEdges.push({ from: j, to: j - 1 });
                tableauEdges.push({ from: j, to: j + 1 });
                tableauEdges.push({ from: j, to: j + 5 });
            }
        }
        //instancie le state pour le graphique
        this.state = {
            nodes: tableauNodes,
            edges: tableauEdges,
        }
        //Set les valeurs pour dijkstra et appelle la methode
        tableauNodesCopie = tableauNodes;
        var retourdijsktra = this.dijkstra2(idDepart, idFin);
        tableauCheminAParcourir = retourdijsktra;
    }
    
    //Indique qu'il faut partourir le tableau a comment d'intervalle
    componentDidMount() {
        this.timerID = setInterval(
            () => this.parcourirtableau(),
            500
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    /*
    Auteur : Bastien Boulanger
    Paramettre : Aucun
    Description : Parcour le tableau a partir de la variable positiondanstableau et change la couleur de la case rendu dans le chemin optimal à rose
    Valeur de retour : Aucune
    */
    parcourirtableau() {
        if (positiondanstableau < tableauCheminAParcourir.length) {
            this.setState(prevState => ({
                nodes: prevState.nodes.map(node => node.id === tableauCheminAParcourir[positiondanstableau] ? { ...node, color: "#E407F6" } : node),
                edges: prevState.edges,
            }));
            positiondanstableau++;
        }
    }

    /*
    Auteur : Bastien Boulanger
    Paramettre : 
                id : l'id de la node du départ
                idaTrouver :  l'id de la node de la fin
    Description : Cherche le chemin le plus optimal pour parcouri le tableau de nodes de la node du départ a la node de fin
    Valeur de retour : un tableau qui contient l'id de chaque node du chemin optimal trouver
    Note : la fonction s'appelle dijkstra2 puisque c'est la deuxieme instance de mon code dijkstra
    */
    dijkstra2(id, idaTrouver) {
        prioQueue.queue({id : id, value : tableauNodesCopie[id].value, chemin : [id]})
        while (prioQueue.length > 0){
            var prochainElement = prioQueue.dequeue();
            if(prochainElement.id === idaTrouver){
                return prochainElement.chemin;
            }
            else{
                this.trouverVoisin(prochainElement);
            }
        }
    }

    /*
    Auteur : Bastien Boulanger
    Paramettre : 
                element : Un element de la priority Queue qui contient un id, une value et un chemin
    Description : Insère les voisins de l'element dans la priority Queue 
    Valeur de retour : Aucune
    */
    trouverVoisin(element) {
        tableauNodesCopie[element.id].visite = true;
        var cheminTemp = [];
        this.state.edges.forEach(edge => {
            cheminTemp = [];
            if (edge.from === element.id && !tableauNodesCopie[edge.to].visite) {
                if (tableauNodesCopie[edge.to].groupe === "Mur") {
                    if (element.value + 25 < tableauNodesCopie[edge.to].value) {
                        tableauNodesCopie[edge.to].value = tableauNodesCopie[element.id].value + 25;
                        element.chemin.forEach(iddechemin => {
                            cheminTemp.push(iddechemin);
                        })
                        cheminTemp.push(edge.to);
                        prioQueue.queue({ id: edge.to, value: tableauNodesCopie[edge.to].value, chemin : cheminTemp});
                    }
                }
                else if (element.value + 1 < tableauNodesCopie[edge.to].value) {
                    tableauNodesCopie[edge.to].value = tableauNodesCopie[element.id].value + 1;
                    element.chemin.forEach(iddechemin => {
                        cheminTemp.push(iddechemin);
                    })
                    cheminTemp.push(edge.to);
                    prioQueue.queue({ id: edge.to, value: tableauNodesCopie[edge.to].value, chemin : cheminTemp});
                }
            }
        });
    }

    render() {
        var retour = [];
        var graph = {
            edges: this.state.edges,
            nodes: this.state.nodes,
        }
        var options = {
            layout: {
                hierarchical: false
            },
            edges: {
                color: "#000000"
            },
            physics: {
                enabled: false,
            }
        };
        retour.push(<Graph graph={graph} options={options} style={{ height: "1000px", width: "1000px" }} />);
        return retour;
    }
}
export default AffichageGraph;