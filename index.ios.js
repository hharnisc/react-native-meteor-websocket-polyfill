/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
} = React;

var _ = require('lodash');
var DDPClient = require("ddp-client");

var todos = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => !_.isEqual(row1, row2),
      }),
      loaded: false,
    };
  },

  componentDidMount: function() {
    var that = this;
    var ddpClient = new DDPClient({url: 'ws://localhost:3000/websocket'});

    ddpClient.connect(() => ddpClient.subscribe('publicLists'));

    // observe the lists collection
    var observer = ddpClient.observe("lists");
    observer.added = () => that.updateRows(_.cloneDeep(_.values(ddpClient.collections.lists)));
    observer.changed = () => that.updateRows(_.cloneDeep(_.values(ddpClient.collections.lists)));
    observer.removed = () => that.updateRows(_.cloneDeep(_.values(ddpClient.collections.lists)));
  },

  updateRows: function(rows) {
    this.setState({
     dataSource: this.state.dataSource.cloneWithRows(rows),
     loaded: true,
   });
  },

  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderList}
        style={styles.listView}
      />
    );
  },

  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Loading lists...
        </Text>
      </View>
    );
  },

  renderList: function(list) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>{list.name}</Text>
        <Text style={styles.incompleteCount}>{list.incompleteCount}</Text>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
  },
  name: {
    flex: 5,
    fontSize: 18,
  },
  incompleteCount: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    color: '#2196F3',
  },
  listView: {
    paddingTop: 20,
    backgroundColor: 'white',
  },
});

AppRegistry.registerComponent('todos', () => todos);
