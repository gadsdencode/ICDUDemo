import {CopilotChatAssistantMessage,type CopilotChatAssistantMessageProps} from '@copilotkit/react-core/v2';
import {FeedbackReview} from './FeedbackReview';
function ReviewableMessageView(props:CopilotChatAssistantMessageProps){
 const messages=props.messages??[];const index=messages.findIndex(m=>m.id===props.message.id);
 const prior=messages.slice(0,index<0?0:index).reverse().find(m=>m.role==='user');
 const question=prior&&'content' in prior&&typeof prior.content==='string'?prior.content:'';
 return <><CopilotChatAssistantMessage {...props}/>{!props.isRunning&&typeof props.message.content==='string'?<FeedbackReview question={question} answer={props.message.content}/>:null}</>;
}

export const ReviewableMessage=Object.assign(ReviewableMessageView,CopilotChatAssistantMessage);
