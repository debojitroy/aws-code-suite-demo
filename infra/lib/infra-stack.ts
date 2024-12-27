import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipeline from 'aws-cdk-lib/aws-codepipeline';
import * as pipelineactions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface InfraStackProps extends cdk.StackProps {
  // Define construct properties here
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
  readonly oauthToken: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    // Creates new pipeline artifacts
    const sourceArtifact = new pipeline.Artifact('SourceArtifact');
    const buildArtifact = new pipeline.Artifact('BuildArtifact');

    // Creates the source stage for CodePipeline
    const sourceStage = {
      stageName: 'Source',
      actions: [
        new pipelineactions.GitHubSourceAction({
          actionName: 'MovieAppSource',
          branch: props.branch || 'main',
          output: sourceArtifact,
          owner: props.owner,
          repo: props.repo,
          oauthToken: cdk.SecretValue.unsafePlainText(props.oauthToken),
        }),
      ],
    };

    const sendToS3 = {
      stageName: 'SendtoS3',
      actions: [
        new pipelineactions.S3DeployAction({
          actionName: 'SendToS3',
          input: new pipeline.Artifact('SourceArtifact'),
          bucket: new s3.Bucket(this, 'MovieAppTempBucket', {
            bucketName: 'movie-app-temp-bucket',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          }),
        }),
      ],
    };

    const movieAppPipeline = new pipeline.Pipeline(this, 'MovieAppPipeline', {
      pipelineName: 'MovieAppPipeline',
      stages: [sourceStage, sendToS3],
    });

    // Define output variable for the pipeline
    new cdk.CfnOutput(this, 'MovieAppPipelineArn', {
      value: movieAppPipeline.pipelineArn,
    });
  }
}
