
export const areFriend=(friend,user)=>{
    if(friend.friends.map(String).includes(user._id.toString())||
     user.friends.map(String).includes(friend._id.toString())){
        return true;
    }
     return false
}
export const requestExists=(friend,user)=>{
    if(friend.friendRequest.map(String).includes(user._id.toString())||
     user.friendRequest.map(String).includes(friend._id.toString())){
        return true;
    }
     return false
}