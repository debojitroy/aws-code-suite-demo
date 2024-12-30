import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';

export interface MainPipelineStackProps extends cdk.StackProps {
  // Define construct properties here
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
  readonly oauthToken: string;
}

export class MainPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MainPipelineStackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'MovieAppPipeline', {
      pipelineName: 'MovieAppPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          `${props.owner}/${props.repo}`,
          props.branch || 'main',
          { authentication: cdk.SecretValue.unsafePlainText(props.oauthToken) }
        ),
        commands: ['cd infra', 'npm ci', 'npm run synth'],
      }),
    });
  }
}
