import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as postGraphController from "./Post/graph/post.graph.controller.js"


export const schema=new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"SocialAppQuery",
        fields:{
            ...postGraphController.query
        }
    }),
    mutation:new GraphQLObjectType({
        name:"socialAppMutation",
        fields:{
            ...postGraphController.mutation
        }
    }),
})