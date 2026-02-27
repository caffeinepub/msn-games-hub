import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";

actor {
  type Message = {
    id : Nat;
    timestamp : Int;
    sender : Text;
    text : Text;
  };

  var nextId = 0;
  let maxMessages = 100;

  let messages = List.empty<Message>();

  public shared ({ caller }) func postMessage(sender : Text, text : Text) : async Nat {
    let timestamp = Time.now();
    let message : Message = {
      id = nextId;
      timestamp;
      sender;
      text;
    };

    messages.add(message);

    // Keep only the last 100 messages
    let currentSize = messages.size();
    if (currentSize > maxMessages) {
      let iter = messages.reverse().toArray().sliceToArray(0, maxMessages).values();
      messages.clear();
      messages.addAll(iter);
    };

    nextId += 1;
    message.id;
  };

  public query ({ caller }) func getMessages() : async [Message] {
    messages.reverse().toArray();
  };
};
