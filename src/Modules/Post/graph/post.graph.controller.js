import * as postServiceQuery from "./post.query.service.js"
import * as postServiceMutation from "./post.mutation.service.js"

import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql"
export const query={
    getAllPosts:{
        type:new GraphQLObjectType({
            name:"getAllPosts",
            fields:{
                message:{type:GraphQLString},
                statusCode:{type:GraphQLInt},
                data:{
                    type:new GraphQLList(
                        new GraphQLObjectType({
                        name:"PostsResponse",
                        fields:{
                            _id:{type:GraphQLID},
                            content:{type:GraphQLString},
                            images:{
                                type:new GraphQLList(new GraphQLObjectType({
                                    name:"allImages",
                                    fields:{
                                        secure_url:{type:GraphQLString},
                                        public_id:{type:GraphQLString},
                                    }
                                }))
                            },
                            createdBy:{type:new GraphQLObjectType({
                                name:"userWhoCreatePost",
                                fields:{
                                    _id:{type:GraphQLID},
                                    userName:{type:GraphQLString},
                                    email:{type:GraphQLString},
                                    password:{type:GraphQLString},
                                    address:{type:GraphQLString},
                                    phone:{type:GraphQLString},
                                    gender:{type:new GraphQLEnumType({
                                        name:"gender",
                                        values:{
                                            male:{type:GraphQLString},
                                            female:{type:GraphQLString}
                                        }
                                    })},
                                    confirmEmail:{type:GraphQLBoolean},
                                    isDeleted:{type:GraphQLBoolean},
                                    viewers:{
                                        type:new GraphQLList(new GraphQLObjectType({
                                            name:"viewers",
                                            fields:{
                                                userId:{type:GraphQLID},
                                                time:{type:GraphQLString},
                                            }
                                        }))
                                    }

                                }
                            })},
                            deletedBy:{type:GraphQLID},
                            likes:{type:new GraphQLList(GraphQLID)},
                            isDeleted:{type:GraphQLBoolean},
                        }
                    }))
                }
            },
        }),
        resolve:postServiceQuery.getAllPosts
    },
}
// export const mutation={
//     likePost:{
//         type:new GraphQLObjectType({
//             name:"likePost",
//             fields:{
//                 message:{type:GraphQLString},
//                 statusCode:{type:GraphQLInt},
//                 data:{
//                     type:new GraphQLList(
//                         new GraphQLObjectType({
//                         name:"PostsResponseforLike",
//                         fields:{
//                             content:{type:GraphQLString},
//                             images:{
//                                 type:new GraphQLList(new GraphQLObjectType({
//                                     name:"allImagesForLikes",
//                                     fields:{
//                                         secure_url:{type:GraphQLString},
//                                         public_id:{type:GraphQLString},
//                                     }
//                                 }))
//                             },
//                             likes:{type:new GraphQLList(GraphQLID)},
//                         }
//                     }))
//                 }
//             },
//         }),
//         args:{
//             postId:{type:new GraphQLNonNull(GraphQLID)},
//             authorization:{type:new GraphQLNonNull(GraphQLString)}
//         },
//         resolve:postServiceMutation.likePost
//     }
// }
export const mutation = {
    likePost: {
        type: new GraphQLObjectType({
            name: "likePost",
            fields: {
                message: { type: GraphQLString },
                statusCode: { type: GraphQLInt },
                data: {
                    type: new GraphQLObjectType({
                        name: "PostsResponseforLike",
                        fields: {
                            content: { type: GraphQLString },
                            images: {
                                type: new GraphQLList(new GraphQLObjectType({
                                    name: "allImagesForLikes",
                                    fields: {
                                        secure_url: { type: GraphQLString },
                                        public_id: { type: GraphQLString },
                                    }
                                }))
                            },
                            likes: { type: new GraphQLList(GraphQLID) },
                        }
                    })
                }
            },
        }),
        args: {
            postId: { type: new GraphQLNonNull(GraphQLID) },
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: postServiceMutation.likePost
    }
};