# =============================================================================
# MCI INDEPENDENT VERIFICATION - REPLIT ENVIRONMENT
# =============================================================================
#
# PURPOSE: Define Nix environment for Replit-based verification
# STATUS: PREPARED FOR EXECUTION
#
# ⚠️  EXECUTION REQUIRES EXPLICIT PROGRAM DIRECTOR AUTHORIZATION  ⚠️
#
# This file configures the Replit environment with all necessary
# dependencies for running MCI verification.
#
# Usage:
#   1. Import repository into Replit
#   2. Replit will automatically use this configuration
#   3. Run ./99_INDEPENDENT_VERIFICATION/REPLIT/run.sh with authorization
#
# =============================================================================

{ pkgs }: {
  deps = [
    # Node.js 20 LTS
    pkgs.nodejs_20
    
    # Package managers
    pkgs.nodePackages.npm
    
    # Build tools
    pkgs.bash
    pkgs.coreutils
    pkgs.jq
    
    # Git for version info
    pkgs.git
  ];
  
  env = {
    # Ensure Node.js uses modern features
    NODE_OPTIONS = "--experimental-vm-modules";
    
    # Verification mode flag
    MCI_VERIFICATION_MODE = "true";
    
    # Replit environment indicator
    REPLIT_ENVIRONMENT = "true";
  };
}
