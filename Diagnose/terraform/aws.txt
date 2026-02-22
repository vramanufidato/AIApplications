//aws_sagemaker.tf
resource "aws_sagemaker_domain" "health_domain" {
  domain_name = "health-ai-domain"
  auth_mode   = "IAM"
  default_user_settings {
    execution_role = aws_iam_role.sagemaker_role.arn
    security_groups = [aws_security_group.phi_sg.id]
  }
}


