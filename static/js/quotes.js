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

    $.get("/quote", function(result) {
      if (this.isMounted()) {
        let quoteIds = _.keys(result);
        quoteIds = _.sampleSize(quoteIds, quoteIds.length);

        var specificQuoteId = getParameterByName('quoteId');
        if (specificQuoteId != "") {
          _.remove(quoteIds, function(x) {
            return x === specificQuoteId;
          });
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

  forceQuote: function(quoteId) {
    $.get("/quote/" + quoteId, function(result) {
      if (this.isMounted()) {
        this.setState({
          quoteText: result.text,
          quoteScore: result.score,
          index: this.state.quotes.length // force invalid index to restart it again
        });
        $('.vote-button').attr('disabled', false);
      }
    }.bind(this));
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
    $.getScript("http://platform.twitter.com/widgets.js");
  },

  loadNextQuote: function(doNotPushState) {
    if (this.state.index >= (this.state.quotes.length - 1)) {
      let quoteIds = _.sampleSize(this.state.quotes, this.state.quotes.length);
      this.setState({
        index: -1,
        quotes: quoteIds
      });
      this.state.index = -1;
    }

    var quoteId = this.state.quotes[this.state.index + 1];

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
            <div className="inner cover">
              <p className="lead">Сегодня я опоздал(а) на работу в связи с тем, что...</p>
              <h1>{this.state.quoteText} <span className="badge">{this.state.quoteScore}</span></h1>
              <p className="lead">
                <button onClick={this.vote(-1)} className="btn btn-lg btn-danger vote-button">
                  <span className="glyphicon glyphicon-thumbs-down" /> Не прокатит
                </button>
                <button onClick={this.vote(1)} className="btn btn-lg btn-success vote-button">
                  <span className="glyphicon glyphicon-thumbs-up" /> Да, чёрт возьми!
                </button>
              </p>
              <p className="twitter-wrapper" style={{height: '20px'}}>
                <a href="https://twitter.com/share" data-text={"У меня сегодня выходной, потому что..."}
                   className="twitter-share-button-template" data-via="naXa_by" data-related="bencxr"
                   data-count="none" data-hashtags="выходной.by">
                  <div id="twitter-share-button-div" />
                </a>
              </p>
            </div>
          </div>
        </div>
    );
  }
});

