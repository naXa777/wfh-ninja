"use strict";

var VoteButton = React.createClass({
  render: function() {
    return (
        <button {...this.props}
            role="button"
            className={(this.props.className || '') + ' vote-button'}/>
    );
  }
});

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
var shuffleArray = function(array) {
  for (var i = array.length-1; i > 0; i-=1) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

var Quotes = React.createClass({
  getInitialState: function() {
    return {
      quoteText: '',
      quotes: [],
      index: -1
    };
  },

  componentDidMount: function() {
    var self = this;
    window.onpopstate = function(event) {
      self.setState({index: event.state.index});
      self.loadNextQuote(true);
    };

    VK.init({apiId: 5443383, onlyWidgets: true});
    VK.Widgets.Like("vk-like", {
      type: "button",
      height: 20,
      pageTitle: "«Выходной бы!» | Генератор отмазок",
      pageDescription: "У меня сегодня выходной, потому что..."
    });

    $.get("/quote", function(result) {
      if (this.isMounted()) {
        let quoteIds = _.keys(result);
        quoteIds = shuffleArray(quoteIds);

        let specificQuoteId = getParameterByName('quoteId');
        if (specificQuoteId != "") {
          //quoteIds = _.without(quoteIds, specificQuoteId);
          let index = _.indexOf(quoteIds, specificQuoteId);
          while (index > 0) {
            quoteIds.splice(index, 1);
            index = _.indexOf(quoteIds, specificQuoteId, index - 1);
          }
          quoteIds.unshift(specificQuoteId);
        }

        this.setState({
          quotes: quoteIds
        });

        this.loadNextQuote();
      }
    }.bind(this));
    window.forceQuote = this.forceQuote;
  },

  forceQuote: function(quoteText) {
    if (this.isMounted()) {
      this.setState({
        quoteText: quoteText + '*',
        quoteScore: 1,
        index: this.state.quotes.length // force invalid index to restart it again
      });
      $('.vote-button').attr('disabled', false);
      $('.moder-notice').removeClass('hide');
    }
  },

  updateTwitterButton: function() {
    // remove any previous clone
    $('#twitter-share-button-div').empty();

    // create a clone of the twitter share button template
    var clone = $('.twitter-share-button-template').clone()

    // fix up our clone
    clone.removeAttr("style"); // unhide the clone
    clone.attr("data-url", window.location.toString());
    clone.attr("class", "twitter-share-button");

    // copy cloned button into div that we can clear later
    $('#twitter-share-button-div').append(clone);

    // reload twitter scripts to force them to run, converting a to iframe
    $.getScript("https://platform.twitter.com/widgets.js");
  },

  loadNextQuote: function(doNotPushState) {
    if (this.state.index >= (this.state.quotes.length - 1)) {
      let quoteIds = shuffleArray(this.state.quotes);
      this.setState({
        index: -1,
        quotes: quoteIds
      });
      this.state.index = -1;
    }

    $('.moder-notice').addClass('hide');

    let quoteId = this.state.quotes[this.state.index + 1];

    $.get("/quote/" + quoteId, function(result) {
      if (this.isMounted()) {
        if (!doNotPushState) {
          history.pushState({index: this.state.index}, result.text, '/?quoteId=' + quoteId);
        }
        this.setState({
          quoteText: result.text,
          index: this.state.index + 1,
          quoteScore: result.score
        });

        this.updateTwitterButton();

        $('.vote-button').attr('disabled', false);
      }
    }.bind(this));
  },

  vote: function(value) {
    return function() {
      $('.vote-button').attr('disabled', true);
      $('.moder-notice').addClass('hide');
      var quoteId = this.state.quotes[this.state.index];
      if (!quoteId) {
        return this.loadNextQuote();
      }
      $.ajax({
        type: 'POST',
        url: "/quote/" + quoteId + '/vote',
        data: JSON.stringify({value: value}),
        contentType: "application/json; charset=utf-8",
        success: function() {
          this.loadNextQuote();
        }.bind(this)
      });
    }.bind(this);
  },

  render: function() {
    return (
        <div className="site-wrapper-inner">
          <div className="cover-container">
            <div className="masthead clearfix">
              <a href="https://github.com/naXa777/wfh-ninja" target="_blank">
                <img style={{position: 'absolute', top: 0, right: 0, border: 0}}
                     src="https://camo.githubusercontent.com/652c5b9acfaddf3a9c326fa6bde407b87f7be0f4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6f72616e67655f6666373630302e706e67"
                     alt="Fork me on GitHub"
                     data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" />
              </a>
              
              <div className="inner">
                <a href="#">
                  <h3 className="masthead-brand">Выходной бы!</h3>
                </a>
              </div>
            </div>

            <div className="inner cover">
              <p className="lead">Сегодня я опоздал(а) на работу в связи с тем, что...</p>
              <h1>{this.state.quoteText} <span className="badge">{this.state.quoteScore}</span></h1>
              <p className="lead">
                <VoteButton onClick={this.vote(-1)} className="btn btn-lg btn-danger">
                  <span className="glyphicon glyphicon-thumbs-down" /> Не прокатит
                </VoteButton>
                <VoteButton onClick={this.vote(1)} className="btn btn-lg btn-success">
                  <span className="glyphicon glyphicon-thumbs-up" /> Да, чёрт возьми!
                </VoteButton>
              </p>

              <div className="text-center">
                <ul className="list-inline">
                <li>
                  <p className="twitter-wrapper" style={{height: '20px'}}>
                    <a href="https://twitter.com/share" data-text="У меня сегодня выходной, потому что..."
                     className="twitter-share-button-template" data-via="naXa_by" data-related="bencxr"
                     data-count="none" data-hashtags="выходной.by">
                      <div id="twitter-share-button-div" />
                    </a>
                  </p>
                </li>
                <li>
                  <div id="vk-like"></div>
                </li>
                </ul>
              </div>

              <div className="moder-notice hide"><i>* Новая отмазка скоро будет рассмотрена и добавлена на сайт.</i></div>

            </div>
          </div>
        </div>
    );
  }
});

